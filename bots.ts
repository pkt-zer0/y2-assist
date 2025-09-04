import { StrikeHeight } from './types.js';
import { bot, BotDefinition } from './bots_types.js';
import {
    BLOCK_HIGH,
    BLOCK_LOW,
    ChoiceInit,
    mDodge,
    moveset,
    MoveSet,
    mProjectile,
    mStrike,
    mThrow,
} from './moves.js';

// Grave
const bot1: BotDefinition = (function() {
    const MOVES: MoveSet = moveset({
        // Normal
        A: mStrike(3, 8, { height: StrikeHeight.Low  }),
        B: mStrike(4, 7, { height: StrikeHeight.Low  }),
        C: mStrike(5, 6),
        D: mStrike(6, 5, { height: StrikeHeight.High }),
        E: mStrike(7, 4, { height: StrikeHeight.High }),
        t: mThrow (7, 5),
        // Defense
        h: BLOCK_HIGH,
        l: BLOCK_LOW,
        d: mDodge(),
        // Special
        X: mProjectile(8, 7, { blockDamage: 4 }),
        Y: mStrike(10, 11,  { blockDamage: 2, unsafe: true }),
        Z: mStrike(7, 7,    { blockDamage: 1, height: StrikeHeight.High }),
        // Super
        1: mStrike(20, 15, { super: true, meter: 2, blockDamage: 1, unsafe: true }),
        2: mDodge(         { super: true, meter: 2, damage: 30 }),
    });

    return bot(MOVES, {
        name: 'Glass Monk',
        normal: [
            { min: 5,  max: 6,  choices: ['l' , 'h'  , 'l'   , 't'   , 'BZ'  , 'ZC'  , 'X'    , 'X' ], hitback: 't' },
            { min: 7,  max: 8,  choices: ['l' , 'h'  , 'l'   , 't'   , 'ABC' , 'Y'   , 'X'    , 'X' ], hitback: 'Y' },
            { min: 9,  max: 10, choices: ['l' , 'h'  , 'l'   , 'tCD' , 'tCD' , 'ABCX', 'ABCX' , 'dt'], hitback: 'Y' },
            { min: 11, max: 12, choices: ['2' , 'dt' , 'tDE' , 'tDE' , 'ABCX', 'Y'   , '1'    , '1' ], hitback: '1' },
        ],
        knockdown: { choices: ['h', 't', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'] },
        desperate: { choices: [null, null, null, null, '1', '1', '1', '1'] },
    });
}());

// Bigby
const bot7: BotDefinition = (function() {
    const MOVES: MoveSet = moveset({
        // Normal
        A: mStrike(5, 7, { height: StrikeHeight.High }),
        B: mStrike(6, 5),
        C: mStrike(7, 4, { height: StrikeHeight.High }),
        D: mStrike(8, 3, { height: StrikeHeight.Low  }),
        E: mStrike(8, 6, { knockdown: true }),
        t: mThrow (9, 8),
        // Defense
        h: BLOCK_HIGH,
        l: BLOCK_LOW,
        d: mDodge(), // Slow dodge
        // Special
        X: mStrike(14, 1, { blockDamage: 4, edge: true, backstep: true }),
        Y: mStrike(9,  6, { blockDamage: 3, pumpDamage: [5], knockdown: true }),
        Z: mThrow (16, 9, { knockdown: false }), // armor: light
        // Super
        1: mStrike(10, 9,  { super: true, meter: 2, blockDamage: 2 }),
        2: mThrow (40, 14, { super: true, meter: 3, knockdown: false }),
    });

    return bot(MOVES, {
        name: 'Whitestar Grappler',
        normal: [
            { min: 5,  max: 6,  choices: ['l' , 'h'  , 'l'   , 'h'   , 't'   , 't'   , 'AB'   , 'DE'   ], hitback: 't' },
            { min: 7,  max: 8,  choices: ['l' , 'h'  , 'l'   , 't'   , 'Z'   , 'X'   , 'ABC'  , 'DE'   ], hitback: 't' },
            { min: 9,  max: 10, choices: ['l' , 'h'  , 'l'   , 'h'   , 't'   , 'Z'   , 'Z'    , 'XD'   ], hitback: 'Z' },
            { min: 11, max: 12, choices: ['2' , '2'  , '2'   , '1'   , 'XD'  , 'dZ'  , 'dZ'   , 'ABC'  ], hitback: '2' },
        ],
        knockdown: { choices: ['l', 'h', 'l', 'h', 'l', 'h', 't', 'DE'] },
    });
}());

// Setsuki
const bot2: BotDefinition = (function() {
    const MOVES: MoveSet = moveset({
        // Normal
        A: mStrike(2, 9, { height: StrikeHeight.Low  }),
        B: mStrike(3, 8, { height: StrikeHeight.Low  }),
        C: mStrike(4, 7, { height: StrikeHeight.High }),
        D: mStrike(5, 6, { height: StrikeHeight.High  }),
        E: mStrike(6, 5),
        t: mThrow (6, 6),
        // Defense
        h: BLOCK_HIGH,
        l: BLOCK_LOW,
        d: mDodge(),
        // Special
        X: mStrike(5,  8, { blockDamage: 1, height: StrikeHeight.High }),
        Y: mStrike(1,  9, { blockDamage: 1, pumpDamage: [4,4] }),
        Z: mStrike(5,  7, { blockDamage: 2, pumpDamage: [3,3] }),
        // Super
        1: mStrike(17, 9, { super: true, meter: 2, blockDamage: 3 }),
        2: mDodge (       { super: true, meter: 2, damage: 30 }), // Fully pumped
    });

    return bot(MOVES, {
        name: 'Fox Primus',
        normal: [
            { min: 5,  max: 6,  choices: ['tB', 'tC' , 'AB'     , 'AB'     , 'AB'    , 'CD'    , 'CD'     , 'dt'   ], hitback: 'tC'     },
            { min: 7,  max: 8,  choices: ['l' , 'h'  , 'l'      , 't'      , 'BCD'   , 'CDE'   , 'dY++'   , 'dY++' ], hitback: 'CDE'    },
            { min: 9,  max: 10, choices: ['l' , 'h'  , 'l'      , 'tCDE'   , 'tCDE'  , 'ABXDE' , 'CDXDE'  , 'd1'   ], hitback: 'tCDE'   },
            { min: 11, max: 12, choices: ['2' , '2'  , 'tZ++DE' , 'tZ++DE' , 'ABCD1' , 'CDE1'  , 'Y++DE1' , '1'    ], hitback: 'Y++DE1' },
        ],
        knockdown: { choices: ['l', 'h', 'l', 'h', 'l', 'h', 't', 'BCD'] },
    });
}());


export const BOTS: Record<string, BotDefinition> = {
    M1: bot1,
    M2: bot2,
    F2: bot7,
};