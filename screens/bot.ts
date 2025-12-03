import { applyOverride, BotDefinition, ChoiceRow } from '../bots_types.js';
import { AppState } from '../state.js';
import {
    ArmorType,
    Choice,
    FLAG_DEFS,
    FLAG_NAMES,
    MoveType,
    StrikeHeight,
} from '../types.js';
import { style, when } from './common.js';

// -- Derived state --
function getChoiceRow(bot: BotDefinition, state: AppState): ChoiceRow {
    const { handSize, mode, desperate } = state;

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
function getChoice(bot: BotDefinition, state: AppState): Choice {
    const { hitback, choiceIndex } = state;

    const row = getChoiceRow(bot, state);
    if (hitback) {
        return row.hitback!;
    }

    return row.choices[choiceIndex];
}

// -- Rendering --

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

function renderRoller() {
    return `<div class="roller"> ? </div>`;
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

export function renderBot(bot: BotDefinition | undefined, state: AppState) {
    const { mode, hitback, choiceIndex, handSize, desperate, showRoll } = state;

    if (!bot) {
        return `
            <div class="header">
                <button class="fixed" data-action="picker">Change</button>
            </div>
            <h1>⚠ Work in progress! ⚠</div>
        `;
    }

    const choice = getChoice(bot, state);
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
            <div class="move"> ${
                showRoll ? renderRoller() : renderMove(choice)
            } </div>
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
