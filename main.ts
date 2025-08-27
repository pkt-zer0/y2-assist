import { applyOverride, BotDefinition, BOTS, ChoiceRow } from './bots.js';
import { Choice, MoveType, StrikeHeight } from './types.js';

//-- State --

let handSize = 9;
let choiceIndex = 0;
let mode = '';
let hitback = false;
let desperate = false;

let chosenBotID: string | undefined = undefined;
let chosenBot: BotDefinition | undefined = undefined;
let showPicker = true;

//-- Actions --

const choiceLeft   = () => { choiceIndex = clamp(choiceIndex - 1, 0, 7); };
const choiceRight  = () => { choiceIndex = clamp(choiceIndex + 1, 0, 7); };
const choiceRandom = () => { choiceIndex = Math.floor(Math.random() * 8); };
const handsizeDown = () => { handSize    = clamp(handSize - 1, 5, 12); };
const handsizeUp   = () => { handSize    = clamp(handSize + 1, 5, 12); };

const toggleKnockdown = () => { mode      = mode ? '' : 'knockdown'; };
const toggleHitback   = () => { hitback   = !hitback; };
const toggleDesperate = () => { desperate = !desperate; };

const displayPicker   = () => { showPicker = true; };
const changeCharacter = (data: DOMStringMap) => {
    const chosen = data.char;
    if (chosen) {
        chosenBotID = chosen;
        chosenBot = BOTS[chosenBotID];
        showPicker = false;
        save();
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
            return '#00f';
    }
}
function typeClass(type: MoveType) {
    switch (type) {
        case MoveType.BlockLow:
        case MoveType.BlockHigh:
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
        height, level, description,
        unsafe, knockdown, edge, recur, lockdown, drawOnBlock,
    } = choice;

    const hasGap = type === MoveType.BlockLow || type === MoveType.BlockHigh;
    const gapPosition = type === MoveType.BlockLow ? '50%' : '0';
    const reversal = speed > 10;
    const speedStyle = reversal ? {
        background: '#333',
        color: 'palegoldenrod',
        'border-color': 'darkgoldenrod',
    } : {
        background: 'palegoldenrod',
        color: 'black',
        'border-color': 'black',
    };
    const levelText = Array(level).fill('I').join('');

    const flags: string[] = [];
    if (unsafe)      { flags.push(`/!\\`); }
    if (knockdown)   { flags.push(`KD`); }
    if (edge)        { flags.push(`(+)`); }
    if (recur)       { flags.push(`RECUR`); }
    if (lockdown)    { flags.push(`LOCK`); }
    if (drawOnBlock) { flags.push(`DRAW`); }

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
        ${when(speed, `<div class="speed" ${style(speedStyle)}> ${speed} </div>`)}
        ${when(blockDamage, `<div class="blockDamage"> ${blockDamage} </div>`)}
        ${when(adjust, `<div class="adjust"> ${adjust}${always ? '!' : ''} </div>`)}
    `;
}

function getChoiceRow(bot: BotDefinition): ChoiceRow {
    // Default choice
    const rowIndex = Math.floor((handSize - 5) / 2);
    let row: ChoiceRow = bot.normal[rowIndex];

    // Mode-specific overrides
    if (desperate) {
        row = applyOverride(row, bot.desperate);
    }
    if (mode === 'knockdown') {
        row = applyOverride(row, bot.knockdown);
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
    if (showPicker) {
        return renderPicker();
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
    const choiceText = hitback ? '*' : choiceIndex + 1;

    return `
        <div class="screen main">
            <div class="header">
                <span>[${handSize}] / ${choiceText}</span>
                <span> ${(bot.name)}</span>
                <button class="fixed" data-action="picker">Change</button>
            </div>
            <div class="move"> ${renderMove(choice)} </div>
            <div class="toggles">
                <button data-action="desperate" class="${toggleClass(desperate)}"> Desperation </button>
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

function renderPicker() {
    return `
        <div class="screen picker">
            <button data-action="pick" data-char="M1">(1) Glass Monk</button>
            <button data-action="pick" data-char="M2">(2) ⚠ Fox Primus</button>
            <button data-action="pick" data-char="M3">(3) ⚠ Colossus</button>
            <button data-action="pick" data-char="M4">(4) ⚠ Twilight Baron</button>
            <button data-action="pick" data-char="M5">(5) ⚠ Dragonborn Centurion</button>

            <button data-action="pick" data-char="F1">(1) ⚠ Soothing Monk</button>
            <button data-action="pick" data-char="F2">(2) ⚠ Whitestar Grappler</button>
            <button data-action="pick" data-char="F3">(3) ⚠ Ancient Hero</button>
            <button data-action="pick" data-char="F4">(4) ⚠ Jandra, the Negator</button>
            <button data-action="pick" data-char="F5">(5) ⚠ Dragonborn Firebat</button>
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
        "h"         : toggleHitback,
        "d"         : toggleDesperate,
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
        hitback   : toggleHitback,
        desperate : toggleDesperate,
        // Character picker
        picker: displayPicker,
        pick  : changeCharacter,
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
