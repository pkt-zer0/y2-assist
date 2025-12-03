import { BOTS } from './bots.js';
import {
    applyOverride,
    BotDefinition,
    ChoiceRow,
    OverrideRow,
} from './bots_types.js';
import {
    ALL_FLAG_DEFS,
    ALL_FLAG_NAMES,
    ArmorType,
    Choice,
    FLAG_DEFS,
    FLAG_NAMES,
    MoveType,
    StrikeHeight,
    UsedFlagNames,
} from './types.js';
import { initWakeLock } from './wake.js';

//-- Globals --
let rerender = function() {}; // Hack to allow rendering from various handlers

//-- State --
class AppState {
    handSize = 9;
    choiceIndex = 0;
    mode = '';
    hitback = false;
    desperate = false;

    chosenBotID: number | undefined = undefined;
    chosenBot: BotDefinition | undefined = undefined;
    showPicker = true;
    showAbout  = false;
    showHelp   = false;
    showRoll   = false;
}

const S = new AppState(); // Global app state

//-- Actions --

const choiceLeft   = () => { S.choiceIndex = clamp(S.choiceIndex - 1, 0, 7); };
const choiceRight  = () => { S.choiceIndex = clamp(S.choiceIndex + 1, 0, 7); };
const handsizeDown = () => { S.handSize    = clamp(S.handSize - 1, 5, 12); };
const handsizeUp   = () => { S.handSize    = clamp(S.handSize + 1, 5, 12); };

const toggleKnockdown = () => { S.mode      = S.mode ? '' : 'knockdown'; };
const toggleWakeup    = () => { S.mode      = S.mode ? '' : 'wakeup'; };
const toggleHitback   = () => { S.hitback   = !S.hitback; };
const toggleDesperate = () => { S.desperate = !S.desperate; };
const toggleDragon    = () => { S.mode      = S.mode ? '' : 'dragon'; };

const displayAbout    = () => { S.showAbout  = !S.showAbout; };
const displayHelp     = () => { S.showHelp   = !S.showHelp; };
const displayPicker   = () => { S.showPicker = true; };
const changeCharacter = (data: DOMStringMap) => {
    const chosen = data.char;
    if (chosen) {
        S.chosenBotID = parseInt(chosen, 10);
        S.chosenBot = BOTS[S.chosenBotID];
        S.showPicker = false;
        S.showHelp = true;
        save();

        // Reset match state
        S.handSize = 9;
        S.choiceIndex = 0;
        S.mode = '';
        S.hitback = false;
        S.desperate = false;
    }
};
const choiceRandom = () => {
    S.choiceIndex = Math.floor(Math.random() * 8);
    S.showRoll = true;
    setTimeout(() => {
        S.showRoll = false;
        rerender();
    }, 1000);
};

//-- Persistence --

const STORAGE_KEY = 'y2_assist';
function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        chosenBotID: S.chosenBotID
    }));
}
function load() {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
        const data = JSON.parse(rawData);
        S.chosenBotID = data.chosenBotID;

        // Update derived state
        S.chosenBot = BOTS[S.chosenBotID!];
        S.showPicker = !S.chosenBotID;
    }
}

//-- Utils --

function style(props: {}) {
    const attributeValue = Object.entries(props)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');
    return `style="${attributeValue}"`;
}

function when(condition: boolean | number, template: string): string {
    return condition ? template : '';
}
function clamp(value: number, min: number, max: number) {
    if (value < min) { return min; }
    if (value > max) { return max; }
    return value;
}

//-- Rendering --

function typeColor(type: MoveType) {
    switch (type) {
        case MoveType.Dodge: return '#080';
        case MoveType.Throw: return '#000';

        case MoveType.Strike:
            return '#f33';
        case MoveType.Projectile:
            return '#f90';
        case MoveType.BlockLow:
        case MoveType.BlockHigh:
        case MoveType.BlockFull:
            return '#00f';
    }
}
function typeClass(type: MoveType) {
    switch (type) {
        case MoveType.BlockLow:
        case MoveType.BlockHigh:
        case MoveType.BlockFull:
            return 'block';
        case MoveType.Projectile:
            return 'projectile';
        default: return '';
    }
}
function toggleClass(enabled: boolean) {
    return enabled ? 'on' : 'off';
}

function heightStyle(height: StrikeHeight) {
    switch (height) {
        case StrikeHeight.Low : return { top: '55%' };
        case StrikeHeight.Mid : return { display: 'none' };
        case StrikeHeight.High: return { top: '25%' };
    }
}

function renderMove(choice: Choice) {
    const { showRoll } = S;

    if (showRoll) {
        return `<div class="roller"> ? </div>`;
    }

    const {
        type, damage, firstDamage, blockDamage, speed, adjust, always,
        height, level, description, armor,
        selfDamage, selfHeal
    } = choice;

    const hasGap = type === MoveType.BlockLow || type === MoveType.BlockHigh;
    const gapPosition = type === MoveType.BlockHigh ? '50%' : '0';
    const reversal = speed > 10;
    const levelText = Array(level).fill('I').join('');

    const flags: string[] = [];
    for (const flagname of FLAG_NAMES) {
        if (choice[flagname]) {
            flags.push(FLAG_DEFS[flagname].icon);
        }
    }

    if (armor === ArmorType.Light)  { flags.push(`[L]`); }
    if (armor === ArmorType.Medium) { flags.push(`[M]`); }
    if (armor === ArmorType.Heavy)  { flags.push(`[H]`); }

    if (selfDamage) { flags.push(`${selfDamage} SELF DMG`); }
    if (selfHeal)   { flags.push(`${selfHeal} SELF HEAL`); }

    return `
        <div class="damage ${typeClass(type)}" style="background: ${typeColor(type)}">
            ${!damage ? '' : damage}
            ${!firstDamage ? '' : `(${firstDamage})`}
            ${!hasGap ? '' : `
                <div class="blockGap" ${style({ top: gapPosition })}></div>
            `}
        </div>
        <div class="description"> ${description} </div>
        <div class="flags"> ${flags.join('<br> ')} </div>
        <div class="height" ${style(heightStyle(height))}></div>

        ${when(level, `<div class="level"> ${levelText} </div>`)}
        ${when(speed, `<div class="speed ${when(reversal, "reversal")}"> ${speed} </div>`)}
        ${when(blockDamage, `<div class="blockDamage"> ${blockDamage} </div>`)}
        ${when(adjust, `<div class="adjust"> ${adjust}${always ? '!' : ''} </div>`)}
    `;
}

function getChoiceRow(bot: BotDefinition): ChoiceRow {
    const { handSize, desperate, mode } = S;

    // Default choice
    const rowIndex = Math.floor((handSize - 5) / 2);
    let row: ChoiceRow = bot.normal[rowIndex];

    // Mode-specific overrides
    if (bot.desperate && desperate) {
        row = applyOverride(row, bot.desperate);
    }
    if (mode === 'knockdown') {
        row = applyOverride(row, bot.knockdown);
    }
    if (bot.wakeup && mode === 'wakeup') {
        row = applyOverride(row, bot.wakeup);
    }
    if (bot.dragon && mode === 'dragon') {
        row = applyOverride(row, bot.dragon);
    }

    return row;
}
function getChoice(bot: BotDefinition): Choice {
    const { hitback, choiceIndex } = S;

    const row = getChoiceRow(bot);
    if (hitback) {
        return row.hitback!;
    }

    return row.choices[choiceIndex];
}

function renderContent() {
    if (S.showAbout) {
        return renderAbout();
    }
    if (S.showHelp) {
        return renderHelp(S.chosenBot);
    }
    if (S.showPicker) {
        return renderPicker(BOTS);
    } else {
        return renderBot(S.chosenBot);
    }
}

function renderBot(bot: BotDefinition | undefined) {
    const { mode, hitback, choiceIndex, handSize, desperate } = S;

    if (!bot) {
        return `
            <div class="header">
                <button class="fixed" data-action="picker">Change</button>
            </div>
            <h1>⚠ Work in progress! ⚠</div>
        `;
    }

    const choice = getChoice(bot);
    const isKnockdown = mode == 'knockdown';
    const isWakeup    = mode == 'wakeup';
    const isDragon    = mode == 'dragon';
    const choiceText = hitback ? '*' : choiceIndex + 1;

    const showDesperate = !!bot.desperate;
    const showWakeup    = !!bot.wakeup;
    const showDragon    = !!bot.dragon;

    return `
        <div class="screen main">
            <div class="header">
                <button class="fixed" data-action="about">About</button>
                <span>[${handSize}] / ${choiceText}</span>
                <button class="fixed" data-action="help">Help</button>
            </div>
            <div class="header">
                <button class="large" data-action="picker">
                    ${(bot.name)}
                </button>
            </div>
            <div class="move"> ${renderMove(choice)} </div>
            <div class="toggles">
                ${when(showDragon, `
                    <button data-action="dragon" class="${toggleClass(isDragon)}"> Dragon </button>
                `)}
                ${when(showDesperate, `
                    <button data-action="desperate" class="${toggleClass(desperate)}"> Desperation </button>
                `)}
                ${when(showWakeup, `
                    <button data-action="wakeup" class="${toggleClass(isWakeup)}"> Wakeup </button>
                `)}
                <button data-action="knockdown" class="${toggleClass(isKnockdown)}"> Knockdown </button>
                <button data-action="hitback" class="${toggleClass(hitback)}"> Hitback </button>
            </div>
            <div class="controls">
                <button data-action="left"> &lt; </button>
                <button data-action="right"> &gt; </button>
                
                <button class="large" data-action="roll"> ROLL </button>
                
                <button data-action="down"> - </button>
                <button data-action="up"> + </button>
            </div>
        </div>
    `;
}

function starsFor(difficulty: number) {
    const filler = 5 - difficulty;
    return '★'.repeat(difficulty) + '☆'.repeat(filler);
}

function renderPicker(bots: BotDefinition[]) {
    return `
        <div class="screen picker">
            ${bots.map((b, index) => `
                <button data-action="pick" data-char="${index}">
                    ${b.name} <br>
                    ${starsFor(b.difficulty)}
                </button>            
            `).join('\n')}
        </div>    
    `;
}

function link(url: string, text: string) {
    return `<a href="${url}" target="_blank">${text}</a>`;
}
function renderAbout() {
    const yomi2    = `https://www.sirlingames.com/yomi2`;
    const handmade = `https://hero.handmade.network/`;
    const source   = `https://github.com/pkt-zer0/y2-assist`;

    return `
        <div class="screen about">
            <div class="controls">
                <button data-action="about">Close</button>
            </div>
            <p>
                Unofficial solo mode assistant for <br>
                Yomi 2 from ${link(yomi2, `Sirlin Games`)}.
            </p>
            <p>
                Lovingly ${link(handmade, `handmade`)} by<br>
                <b>Kovács "pkt" György</b>.
            </p>
            <p>${link(source, `Source code`)}<br> also available for the curious.</p>
        </div>    
    `;

}

function renderHelp(chosenBot: BotDefinition | undefined) {
    function possibleChoices(bot: BotDefinition): Choice[] {
        // Various helpers to flatten the structure
        function toSingleton(optional: Choice | null | undefined): Choice[] {
            if (optional) {
                return [optional];
            }
            return [];
        }
        function choicesFromRow(row?: ChoiceRow): Choice[] {
            if (!row) {
                return [];
            }
            return [
                ...row.choices.flatMap(toSingleton),
                ...toSingleton(row.hitback),
            ];

        }
        function choicesFromOverride(override?: OverrideRow): Choice[] {
            if (!override) {
                return [];
            }
            return [
                ...override.choices.flatMap(toSingleton),
                ...toSingleton(override.hitback),
            ];
        }

        // Iterate over all possible choices
        return [
            ...bot.normal.flatMap(c => choicesFromRow(c)),
            ...choicesFromRow(bot.knockdown),
            ...choicesFromOverride(bot.desperate),
            ...choicesFromRow(bot.wakeup),
            ...choicesFromRow(bot.dragon),
        ];
    }

    function flagsUsed(bot: BotDefinition): UsedFlagNames[] {
        const usedFlags = new Set<UsedFlagNames>();
        for (const choice of possibleChoices(bot)) {
            for (const flag of FLAG_NAMES) {
                if (!!choice[flag]) {
                    usedFlags.add(flag);
                }
            }

            if (choice.armor === ArmorType.Light)  { usedFlags.add('armorL'); }
            if (choice.armor === ArmorType.Medium) { usedFlags.add('armorM'); }
            if (choice.armor === ArmorType.Heavy)  { usedFlags.add('armorH'); }

            if (choice.selfDamage) { usedFlags.add('selfDamage'); }
            if (choice.selfHeal)   { usedFlags.add('selfHeal'); }
        }

        return ALL_FLAG_NAMES.filter(flag => {
            return usedFlags.has(flag);
        });
    }

    if (!chosenBot) {
        throw Error('Invalid state: Help screen should only be openable after choosing a bot.');
    }

    return `
        <div class="screen help">
            <div class="controls">
                <button data-action="help">Close</button>
            </div>
            <div class="charinfo">
                <div class="name">
                    ${chosenBot.name} <br>
                    ${starsFor(chosenBot.difficulty)}                
                </div>
                <div class="health"> ❤ ${chosenBot.health} </div>
            </div>
            <div class="content">            
                <div class="abilities">
                    ${chosenBot.abilities.map(ability => `
                        <article>
                            <h4>${ability.name}</h4>
                            <p>${ability.description}</p>
                        </article>
                    `).join('\n')}
                </div>
                <div class="splitter">
                    Trait shorthands
                </div>
                ${flagsUsed(chosenBot).map(flag => {
                    const def = ALL_FLAG_DEFS[flag];
                    return `
                    <article>
                        <h4>
                            ${def.icon} <code>[${flag}]</code> 
                        </h4>
                        <p>${def.desc}</p>
                    </article>`;
                }).join('\n')}
            </div>
        </div>    
    `;
}

type EventHandler<T> = (data: T) => void;

function main() {
    const html = document.documentElement;
    const container = document.querySelector('#main')!;

    const KEY_HANDLERS: Record<string, EventHandler<void>> = {
        "ArrowLeft" : choiceLeft,
        "ArrowRight": choiceRight,
        "ArrowUp"   : handsizeDown,
        "ArrowDown" : handsizeUp,
        "r"         : choiceRandom,
        "k"         : toggleKnockdown,
        "w"         : toggleWakeup,
        "h"         : toggleHitback,
        "d"         : toggleDesperate,
        "t"         : toggleDragon,
    };
    document.addEventListener('keydown', (e) => {
        const handler = KEY_HANDLERS[e.key];
        if (handler) {
            handler();
            render();
        }
    });

    const ACTION_HANDLERS: Record<string, EventHandler<DOMStringMap>> = {
        roll : choiceRandom,
        left : choiceLeft,
        right: choiceRight,
        up   : handsizeUp,
        down : handsizeDown,
        // Toggles
        knockdown : toggleKnockdown,
        wakeup    : toggleWakeup,
        hitback   : toggleHitback,
        desperate : toggleDesperate,
        dragon    : toggleDragon,
        // Character picker
        picker: displayPicker,
        pick  : changeCharacter,
        // Misc
        about: displayAbout,
        help : displayHelp,
    };
    html.addEventListener('click', e => {
        const target = e.target;
        if (target instanceof HTMLButtonElement) {
            const handler = ACTION_HANDLERS['' + target.dataset.action];
            if (handler) {
                handler(target.dataset);
                render();
                // Workaround to ensure init happens in "user interaction"
                initWakeLock().then(); // Background process, ignore return
            }
        }
    });

    function render() {
        container.innerHTML = renderContent();
    }

    // Rerender with initial state
    load();
    render();

    rerender = render; // Expose rendering trigger to animations
}

document.addEventListener('DOMContentLoaded', main);
