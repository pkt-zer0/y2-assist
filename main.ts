import { bot1, MoveType, MoveChoice, StrikeHeight } from './bots.js';

//-- State --

let handSize = 5;
let choiceIndex = 0;

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
        case StrikeHeight.Low : return { top: '25px' };
        case StrikeHeight.Mid : return { display: 'none' };
        case StrikeHeight.High: return { top: '55px' };

    }
}

function renderMove(choice: MoveChoice) {
    const {
        type, damage, firstDamage, blockDamage, speed, adjust, always,
        height, level,
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
        <div class="flags"> ${flags.join('<br> ')} </div>
        <div class="height" ${style(heightStyle(height))}></div>

        ${when(level, `<div class="level"> ${levelText} </div>`)}
        ${when(speed, `<div class="speed" ${style(speedStyle)}> ${speed} </div>`)}
        ${when(blockDamage, `<div class="blockDamage"> ${blockDamage} </div>`)}
        ${when(adjust, `<div class="adjust"> ${adjust}${always ? '!' : ''} </div>`)}
    `;
}

function renderContent() {
    const rowIndex = Math.floor((handSize - 5) / 2);
    const row = bot1.normal[rowIndex];
    const choice = row.choices[choiceIndex];

    return `
        <div class="header"> [${handSize}] / ${choiceIndex + 1} </div>
        <div class="move"> ${renderMove(choice)} </div>
    `;
}

function main() {
    const container = document.querySelector('#main')!;
    const rollButton = document.querySelector('#roll')!;

    const KEY_HANDLERS =  {
        "ArrowLeft" : () => { choiceIndex = clamp(choiceIndex - 1, 0, 7); },
        "ArrowRight": () => { choiceIndex = clamp(choiceIndex + 1, 0, 7); },
        "ArrowUp"   : () => { handSize    = clamp(handSize - 1, 5, 12); },
        "ArrowDown" : () => { handSize    = clamp(handSize + 1, 5, 12); },
        "r"         : () => { choiceIndex = Math.floor(Math.random() * 7); },
    };
    document.addEventListener('keydown', (e) => {
        const handler = KEY_HANDLERS[e.key];
        if (handler) {
            handler();
            render();
        }
    });
    rollButton.addEventListener("click", () => {
        choiceIndex = Math.floor(Math.random() * 7);
        render();
    });
    
    function render() {
        container.innerHTML = renderContent();
    }
    render();
}

document.addEventListener('DOMContentLoaded', main);