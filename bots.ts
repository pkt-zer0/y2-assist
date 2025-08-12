export enum MoveType {
    Dodge,
    Throw,
    // Attacks
    Strike,
    Projectile,
    // Blocks
    BlockLow,
    BlockHigh,
}

export enum StrikeHeight {
    Low, Mid, High
}

export type MoveChoice = {
    type        : MoveType;
    damage      : number;
    blockDamage : number;
    firstDamage : number;
    speed       : number;
    adjust      : number;
    level       : number; // Projectiles only
    height      : StrikeHeight;
    description : string;

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

/* Move description shorthand (case sensitive):
  - A..J : normals
  - t, l, h, b, d: throw, low/high/full block, dodge
  - 1, 2 : super 1/2
  - !, ? : ability, gem ability
  - S, U : gem special, burst
*/

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
    description: '',
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
        description: 't',
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
        description: 'd',
        damage,
    };
}

export const bot1: BotDefinition = {
    normal: [
        { minHand: 5, maxHand: 6, choices: [
                BLOCK_LOW,
                BLOCK_HIGH,
                BLOCK_LOW,
                mThrow     ( 7, 5),
                mStrike    (11, 7, { description: 'B → Z', adjust: -1, firstDamage: 4, height: StrikeHeight.Low }),
                mStrike    (12, 7, { description: 'Z → C', adjust: -1, blockDamage: 1, firstDamage: 7, height: StrikeHeight.High }),
                mProjectile( 7, 7, { description: 'X', blockDamage: 3 }),
                mProjectile( 7, 7, { description: 'X', blockDamage: 3 }),
            ] },
        { minHand: 7, maxHand: 8, choices: [
                BLOCK_LOW,
                BLOCK_HIGH,
                BLOCK_LOW,
                mThrow     ( 7,  5, ),
                mStrike    (12,  8, { description: 'A → BC', adjust: -2, firstDamage: 3, height: StrikeHeight.Low }),
                mStrike    (10, 11, { description: 'Y', blockDamage: 2, unsafe: true }),
                mProjectile( 7,  7, { description: 'X', blockDamage: 3 }),
                mProjectile( 7,  7, { description: 'X', blockDamage: 3 }),
            ] },
        { minHand: 9, maxHand: 10, choices: [
                BLOCK_LOW,
                BLOCK_HIGH,
                BLOCK_LOW,
                mThrow (18, 5, { description: 't → CD',  adjust: -2, firstDamage: 7 }),
                mThrow (18, 5, { description: 't → CD',  adjust: -2, firstDamage: 7 }),
                mStrike(20, 8, { description: 'A → BCX', adjust: -3, firstDamage: 3, height: StrikeHeight.Low }),
                mStrike(20, 8, { description: 'A → BCX', adjust: -3, firstDamage: 3, height: StrikeHeight.Low }),
                mDodge (7,     { description: 'd → t',   adjust: -1 }),
            ] },
        { minHand: 11, maxHand: 12, choices: [
                mDodge (30,     { description: '2',       adjust: -2, always: true }),
                mDodge (7,      { description: 'd → t',   adjust: -1, knockdown: true }),
                mThrow (20, 5,  { description: 't → DE',  adjust: -2, firstDamage: 7 }),
                mThrow (20, 5,  { description: 't → DE',  adjust: -2, firstDamage: 7 }),
                mStrike(20, 8,  { description: 'A → BCX', adjust: -3, firstDamage: 3, height: StrikeHeight.Low }),
                mStrike(10, 11, { description: 'Y', blockDamage: 2, unsafe: true }),
                mStrike(20, 15, { description: '1', blockDamage: 1, adjust: -2, always: true, unsafe: true }),
                mStrike(20, 15, { description: '1', blockDamage: 1, adjust: -2, always: true, unsafe: true }),
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
