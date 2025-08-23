import { applyOverride, bot1, BotDefinition, ChoiceRow } from './bots.js';
import { Choice, MoveType, StrikeHeight } from './types.js';

//-- State --

let handSize = 9;
let choiceIndex = 0;
let mode = '';
let hitback = false;
let desperate = false;

//-- Actions --

const choiceLeft   = () => { choiceIndex = clamp(choiceIndex - 1, 0, 7); };
const choiceRight  = () => { choiceIndex = clamp(choiceIndex + 1, 0, 7); };
const choiceRandom = () => { choiceIndex = Math.floor(Math.random() * 8); };
const handsizeDown = () => { handSize    = clamp(handSize - 1, 5, 12); };
const handsizeUp   = () => { handSize    = clamp(handSize + 1, 5, 12); };

const toggleKnockdown = () => { mode      = mode ? '' : 'knockdown'; };
const toggleHitback   = () => { hitback   = !hitback; };
const toggleDesperate = () => { desperate = !desperate; };

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

function heightStyle(height: StrikeHeight) {
    switch (height) {
        case StrikeHeight.Low : return { top: '25%' };
        case StrikeHeight.Mid : return { display: 'none' };
        case StrikeHeight.High: return { top: '55%' };

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
    const choice = getChoice(bot1);
    const modeStr = !mode ? '' : `(${mode.toUpperCase()})`;
    const isKnockdown = mode == 'knockdown';
    const choiceText = hitback ? '*' : choiceIndex + 1;

    return `
        <div class="controls">
            <button data-action="down"> - </button>
            <button data-action="up"> + </button>
            
            <button class="large" data-action="roll"> ROLL </button>
            
            <button data-action="left"> &lt; </button>
            <button data-action="right"> &gt; </button>
        </div>
        <div class="toggles">
            <label>
                <input type="checkbox" name="knockdown" ${when(isKnockdown, 'checked')} />        
                Knockdown
            </label>
            <label>
                <input type="checkbox" name="hitback" ${when(hitback, 'checked')} />        
                Hitback
            </label>
            <label>
                <input type="checkbox" name="desperate" ${when(desperate, 'checked')} />        
                Desperate
            </label>
        </div>
        <div class="header"> [${handSize}] / ${choiceText} ${modeStr}</div>
        <div class="move"> ${renderMove(choice)} </div>
    `;
}

type EventHandler = () => void;

function main() {
    const html = document.documentElement;
    const container = document.querySelector('#main')!;

    const KEY_HANDLERS: Record<string, EventHandler> = {
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

    const ACTION_HANDLERS: Record<string, EventHandler> = {
        roll : choiceRandom,
        left : choiceLeft,
        right: choiceRight,
        up   : handsizeUp,
        down : handsizeDown,
    };
    html.addEventListener('click', e => {
        const target = e.target;
        if (target instanceof HTMLButtonElement) {
            const handler = ACTION_HANDLERS['' + target.dataset.action];
            if (handler) {
                handler();
                render();
            }
        }
    });

    html.addEventListener('change', e => {
        const target = e.target;
        if (target instanceof HTMLInputElement) {
            if (target.name === 'knockdown') {
                toggleKnockdown();
            } else if (target.name === 'hitback') {
                toggleHitback();
            } else if (target.name === 'desperate') {
                toggleDesperate();
            }
        }
        render();
    });
    
    function render() {
        container.innerHTML = renderContent();
    }
    render();
}

document.addEventListener('DOMContentLoaded', main);
