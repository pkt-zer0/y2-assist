import { BOTS } from './bots.js';
import { applyOverride, BotDefinition, ChoiceRow } from './bots_types.js';
import {
    ArmorType,
    Choice,
    FLAG_DEFS,
    FLAG_NAMES,
    MoveType,
    StrikeHeight,
} from './types.js';

//-- State --

let handSize = 9;
let choiceIndex = 0;
let mode = '';
let hitback = false;
let desperate = false;

let chosenBotID: number | undefined = undefined;
let chosenBot: BotDefinition | undefined = undefined;
let showPicker = true;
let showAbout  = false;
let showHelp   = false;

//-- Actions --

const choiceLeft   = () => { choiceIndex = clamp(choiceIndex - 1, 0, 7); };
const choiceRight  = () => { choiceIndex = clamp(choiceIndex + 1, 0, 7); };
const choiceRandom = () => { choiceIndex = Math.floor(Math.random() * 8); };
const handsizeDown = () => { handSize    = clamp(handSize - 1, 5, 12); };
const handsizeUp   = () => { handSize    = clamp(handSize + 1, 5, 12); };

const toggleKnockdown = () => { mode      = mode ? '' : 'knockdown'; };
const toggleWakeup    = () => { mode      = mode ? '' : 'wakeup'; };
const toggleHitback   = () => { hitback   = !hitback; };
const toggleDesperate = () => { desperate = !desperate; };
const toggleDragon    = () => { mode      = mode ? '' : 'dragon'; };

const displayAbout    = () => { showAbout  = !showAbout; };
const displayHelp     = () => { showHelp   = !showHelp; };
const displayPicker   = () => { showPicker = true; };
const changeCharacter = (data: DOMStringMap) => {
    const chosen = data.char;
    if (chosen) {
        chosenBotID = parseInt(chosen, 10);
        chosenBot = BOTS[chosenBotID];
        showPicker = false;
        save();

        // Reset match state
        handSize = 9;
        choiceIndex = 0;
        mode = '';
        hitback = false;
        desperate = false;
    }
};

//-- Persistence --

const STORAGE_KEY = 'y2_assist';
function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        chosenBotID
    }));
}
function load() {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
        const data = JSON.parse(rawData);
        chosenBotID = data.chosenBotID;

        // Update derived state
        chosenBot = BOTS[chosenBotID!];
        showPicker = !chosenBotID;
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
    const row = getChoiceRow(bot);
    if (hitback) {
        return row.hitback!;
    }

    return row.choices[choiceIndex];
}

function renderContent() {
    if (showAbout) {
        return renderAbout();
    }
    if (showHelp) {
        return renderHelp();
    }
    if (showPicker) {
        return renderPicker(BOTS);
    } else {
        return renderBot(chosenBot);
    }
}

function renderBot(bot: BotDefinition | undefined) {
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
                <button class="fixed" data-action="help">Help</button>
            </div>
            <div class="header">
                <span>[${handSize}] / ${choiceText}</span>
                <span> ${(bot.name)}</span>
                <button class="fixed" data-action="picker">Change</button>
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

function renderHelp() {
    return `
        <div class="screen help">
            <div class="controls">
                <button data-action="help">Close</button>
            </div>
            <div class="content">            
            ${FLAG_NAMES.map(flag => {
                const def = FLAG_DEFS[flag];
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
            }
        }
    });

    function render() {
        container.innerHTML = renderContent();
    }

    // Rerender with initial state
    load();
    render();
}

document.addEventListener('DOMContentLoaded', main);
