import { bot1, MoveType, StrikeHeight } from './bots.js';

//-- State --

let rowIndex = 0;
let choiceIndex = 0;

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

function style(props: any) {
    const attributeValue = Object.entries(props)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');
    return `style="${attributeValue}"`;
}

function renderContent() {
    const row = bot1.normal[rowIndex];
    const choice = row.choices[choiceIndex];

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
        <div class="header">
            [${row.minHand}-${row.maxHand}] / ${choiceIndex + 1}
        </div>
        <div class="damage ${typeClass(type)}" style="background: ${typeColor(type)}">
            ${!damage ? '' : damage}
            ${!firstDamage ? '' : `(${firstDamage})`}
            ${!hasGap ? '' : `
                <div class="blockGap" ${style({ top: gapPosition })}></div>
            `}
        </div>
        ${!level ? '' : `
            <div class="level">${levelText}</div>
        `}
        ${!speed ? '' : `
        <div class="speed" ${style(speedStyle)}>
            ${speed}
            </div>
        `}
        ${!blockDamage ? '' : `
        <div class="blockDamage">
            ${blockDamage}
        </div>
        `}
        ${!adjust ? '' : `
        <div class="adjust"> ${adjust}${always ? '!' : ''}</div>
        `}
        <div class="flags">${flags.join('<br> ')}</div>
        <div class="height" ${style(heightStyle(height))}></div>
        `;
}

function main() {
    const container = document.querySelector('#main')!;
    const rollButton = document.querySelector('#roll')!;

    document.addEventListener('keydown', (e) => {
        if (e.key === "ArrowLeft") {
            if (choiceIndex > 0) {
                choiceIndex -= 1;
            }
            render();
        } else if (e.key === "ArrowRight") {
            if (choiceIndex < 7) {
                choiceIndex += 1;
            }
            render();
        } else if (e.key === "ArrowDown") {
            if (rowIndex < 3) {
                rowIndex += 1;
            }
            render();
        } else if (e.key === "ArrowUp") {
            if (rowIndex > 0) {
                rowIndex -= 1;
            }
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