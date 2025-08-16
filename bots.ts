import {
    BLOCK_HIGH,
    BLOCK_LOW,
    cDodge,
    Choice,
    cProjectile,
    cStrike,
    cThrow,
    StrikeHeight,
} from './types.js';

interface HandSizeRange {
    minHand: number;
    maxHand: number;
}

type MoveChoiceRow = HandSizeRange & {
    /** Index corresponds to the dice roll needed */
    choices: Choice[];
}

type HitbackChoice = HandSizeRange & Choice;

interface BotDefinition {
    normal: MoveChoiceRow[];
    knockdown: Choice[];
    hitback: HitbackChoice[];
}

export const bot1: BotDefinition = {
    normal: [
        { minHand: 5, maxHand: 6, choices: [
                BLOCK_LOW,
                BLOCK_HIGH,
                BLOCK_LOW,
                cThrow     ( 7, 5),
                cStrike    (11, 7, { description: 'B → Z', adjust: -1, firstDamage: 4, height: StrikeHeight.Low }),
                cStrike    (12, 7, { description: 'Z → C', adjust: -1, blockDamage: 1, firstDamage: 7, height: StrikeHeight.High }),
                cProjectile( 8, 7, { description: 'X', blockDamage: 4 }),
                cProjectile( 8, 7, { description: 'X', blockDamage: 4 }),
            ] },
        { minHand: 7, maxHand: 8, choices: [
                BLOCK_LOW,
                BLOCK_HIGH,
                BLOCK_LOW,
                cThrow     ( 7,  5, ),
                cStrike    (12,  8, { description: 'A → BC', adjust: -2, firstDamage: 3, height: StrikeHeight.Low }),
                cStrike    (10, 11, { description: 'Y', blockDamage: 2, unsafe: true }),
                cProjectile( 8,  7, { description: 'X', blockDamage: 4 }),
                cProjectile( 8,  7, { description: 'X', blockDamage: 4 }),
            ] },
        { minHand: 9, maxHand: 10, choices: [
                BLOCK_LOW,
                BLOCK_HIGH,
                BLOCK_LOW,
                cThrow (18, 5, { description: 't → CD',  adjust: -2, firstDamage: 7, knockdown: false }),
                cThrow (18, 5, { description: 't → CD',  adjust: -2, firstDamage: 7, knockdown: false }),
                cStrike(20, 8, { description: 'A → BCX', adjust: -3, firstDamage: 3, height: StrikeHeight.Low }),
                cStrike(20, 8, { description: 'A → BCX', adjust: -3, firstDamage: 3, height: StrikeHeight.Low }),
                cDodge (7,     { description: 'd → t',   adjust: -1, knockdown: true }),
            ] },
        { minHand: 11, maxHand: 12, choices: [
                cDodge (30,     { description: '2',       adjust: -2, always: true, super: true }),
                cDodge (7,      { description: 'd → t',   adjust: -1, knockdown: true }),
                cThrow (20, 5,  { description: 't → DE',  adjust: -2, firstDamage: 7, knockdown: false }),
                cThrow (20, 5,  { description: 't → DE',  adjust: -2, firstDamage: 7, knockdown: false }),
                cStrike(20, 8,  { description: 'A → BCX', adjust: -3, firstDamage: 3, height: StrikeHeight.Low }),
                cStrike(10, 11, { description: 'Y', blockDamage: 2, unsafe: true }),
                cStrike(20, 15, { description: '1', blockDamage: 1, adjust: -2, always: true, unsafe: true, super: true }),
                cStrike(20, 15, { description: '1', blockDamage: 1, adjust: -2, always: true, unsafe: true, super: true }),
            ] },
    ],
    knockdown: [
        BLOCK_HIGH,
        cThrow ( 7, 5),
        cStrike(10, 11, { blockDamage: 2, unsafe: true }),
        cStrike(10, 11, { blockDamage: 2, unsafe: true }),
        cStrike(10, 11, { blockDamage: 2, unsafe: true }),
        cStrike(10, 11, { blockDamage: 2, unsafe: true }),
        cStrike(10, 11, { blockDamage: 2, unsafe: true }),
        cStrike(10, 11, { blockDamage: 2, unsafe: true }),
    ],
    hitback: [
        { minHand: 5,  maxHand: 6,  ...cThrow ( 7, 0), adjust: -1 },
        { minHand: 7,  maxHand: 8,  ...cStrike(10, 0), adjust: -1 },
        { minHand: 9,  maxHand: 10, ...cStrike(10, 0), adjust: -1 },
        { minHand: 11, maxHand: 12, ...cStrike(20, 0), adjust: -2 },
    ],
};
