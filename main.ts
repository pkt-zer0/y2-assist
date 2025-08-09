enum MoveType {
    Dodge,
    Throw,
    // Attacks
    Strike,
    Projectile,
    // Blocks
    BlockLow,
    BlockHigh,
}

enum StrikeHeight {
    Low, Mid, High
}

type MoveChoice = {
    type        : MoveType;
    damage      : number;
    blockDamage : number;
    firstDamage : number;
    speed       : number;
    adjust      : number;
    level       : number; // Projectiles only
    height      : StrikeHeight;

    // Various optional flags
    recur?      : boolean  // draw if not hit
    drawOnBlock?: boolean; // draw if strike blocked
    knockdown?  : boolean;
    edge?       : boolean;
    lockdown?   : boolean; // prevent draw on block
    super?      : boolean;
    unsafe?     : boolean; // hit back if blocked
    always?     : boolean; // adjust handsize even if whiffed

};

type HandSizeRange = {
    minHand: number;
    maxHand: number;
}

type MoveChoiceRow = HandSizeRange & {
    /** Index corresponds to the dice roll needed */
    choices: MoveChoice[];
}

type HitbackChoice = HandSizeRange & MoveChoice;

interface BotDefinition {
    normal: MoveChoiceRow[];
    knockdown: MoveChoice[];
    hitback: HitbackChoice[];
}

const MOVE_DEFAULTS = {
    adjust: 0,
    damage: 0,
    speed: 0,
    level: 0,
    blockDamage: 0,
    firstDamage: 0,
    height: StrikeHeight.Mid,
};

const BLOCK_LOW: MoveChoice = {
    ...MOVE_DEFAULTS,
    type: MoveType.BlockLow,
    drawOnBlock: true,
    recur: true,
};
const BLOCK_HIGH: MoveChoice = {
    ...MOVE_DEFAULTS,
    type: MoveType.BlockHigh,
    drawOnBlock: true,
    recur: true,
};

function mThrow(
    damage: number, speed: number, overrides: Partial<MoveChoice> = {}
): MoveChoice {
    return {
        ...MOVE_DEFAULTS,
        type: MoveType.Throw,
        damage,
        speed,
        knockdown: true,
        ...overrides,
    };
}
function mStrike(
    damage: number, speed: number, overrides: Partial<MoveChoice> = {}
): MoveChoice {
    return {
        ...MOVE_DEFAULTS,
        type: MoveType.Strike,
        damage,
        speed,
        ...overrides,
    };
}
function mProjectile(
    damage: number, speed: number, overrides: Partial<MoveChoice> = {}
): MoveChoice {
    return {
        ...MOVE_DEFAULTS,
        type: MoveType.Projectile,
        damage,
        speed,
        level: 1,
        recur: true,
        lockdown: true,
        ...overrides,
    };
}
function mDodge(
    damage: number, overrides: Partial<MoveChoice> = {}
): MoveChoice {
    return {
        ...MOVE_DEFAULTS,
        type: MoveType.Dodge,
        damage,
    };
}

const bot1: BotDefinition = {
    normal: [
        { minHand: 5, maxHand: 6, choices: [
            BLOCK_LOW,
            BLOCK_HIGH,
            BLOCK_LOW,
            mThrow     ( 7, 5),
            mStrike    (11, 7, { adjust: -1, firstDamage: 4, height: StrikeHeight.Low }),
            mStrike    (12, 7, { adjust: -1, blockDamage: 1, firstDamage: 7, height: StrikeHeight.High }),
            mProjectile( 7, 7, { blockDamage: 3 }),
            mProjectile( 7, 7, { blockDamage: 3 }),
        ] },
        { minHand: 7, maxHand: 8, choices: [
            BLOCK_LOW,
            BLOCK_HIGH,
            BLOCK_LOW,
            mThrow     ( 7,  5, ),
            mStrike    (12,  8, { adjust: -2, firstDamage: 3, height: StrikeHeight.Low }),
            mStrike    (10, 11, { blockDamage: 2, unsafe: true }),
            mProjectile( 7,  7, { blockDamage: 3 }),
            mProjectile( 7,  7, { blockDamage: 3 }),
        ] },
        { minHand: 9, maxHand: 10, choices: [
            BLOCK_LOW,
            BLOCK_HIGH,
            BLOCK_LOW,
            mThrow (18, 5, { adjust: -2, firstDamage: 7 }),
            mThrow (18, 5, { adjust: -2, firstDamage: 7 }),
            mStrike(20, 8, { adjust: -3, firstDamage: 3, height: StrikeHeight.Low }),
            mStrike(20, 8, { adjust: -3, firstDamage: 3, height: StrikeHeight.Low }),
            mDodge (7,     { adjust: -1 }),
        ] },
        { minHand: 11, maxHand: 12, choices: [
            mDodge (30, { adjust: -2, always: true }),
            mDodge (7,  { adjust: -1, knockdown: true }),
            mThrow (20, 5, { adjust: -2, firstDamage: 7 }),
            mThrow (20, 5, { adjust: -2, firstDamage: 7 }),
            mStrike(20, 8, { adjust: -3, firstDamage: 3, height: StrikeHeight.Low }),
            mStrike(10, 11, { blockDamage: 2, unsafe: true }),
            mStrike(20, 15, { blockDamage: 1, adjust: -2, always: true, unsafe: true }),
            mStrike(20, 15, { blockDamage: 1, adjust: -2, always: true, unsafe: true }),
        ] },
    ],
    knockdown: [
        BLOCK_HIGH,
        mThrow ( 7, 5),
        mStrike(10, 11, { blockDamage: 2, unsafe: true }),
        mStrike(10, 11, { blockDamage: 2, unsafe: true }),
        mStrike(10, 11, { blockDamage: 2, unsafe: true }),
        mStrike(10, 11, { blockDamage: 2, unsafe: true }),
        mStrike(10, 11, { blockDamage: 2, unsafe: true }),
        mStrike(10, 11, { blockDamage: 2, unsafe: true }),
    ],
    hitback: [
        { minHand: 5,  maxHand: 6,  ...mThrow ( 7, 0), adjust: -1 },
        { minHand: 7,  maxHand: 8,  ...mStrike(10, 0), adjust: -1 },
        { minHand: 9,  maxHand: 10, ...mStrike(10, 0), adjust: -1 },
        { minHand: 11, maxHand: 12, ...mStrike(20, 0), adjust: -2 },
    ],
};

let rowIndex = 3;
let choiceIndex = 7;

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