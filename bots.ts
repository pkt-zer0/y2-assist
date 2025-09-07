import { ArmorType, StrikeHeight } from './types.js';
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
        difficulty: 1,
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
        difficulty: 2,
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
        D: mStrike(5, 6, { height: StrikeHeight.High }),
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
        difficulty: 2,
        normal: [
            { min: 5,  max: 6,  choices: ['tB', 'tC' , 'AB'     , 'AB'     , 'AB'    , 'CD'    , 'CD'     , 'dt'   ], hitback: 'tC'     },
            { min: 7,  max: 8,  choices: ['l' , 'h'  , 'l'      , 't'      , 'BCD'   , 'CDE'   , 'dY++'   , 'dY++' ], hitback: 'CDE'    },
            { min: 9,  max: 10, choices: ['l' , 'h'  , 'l'      , 'tCDE'   , 'tCDE'  , 'ABXDE' , 'CDXDE'  , 'd1'   ], hitback: 'tCDE'   },
            { min: 11, max: 12, choices: ['2' , '2'  , 'tZ++DE' , 'tZ++DE' , 'ABCD1' , 'CDE1'  , 'Y++DE1' , '1'    ], hitback: 'Y++DE1' },
        ],
        knockdown: { choices: ['l', 'h', 'l', 'h', 'l', 'h', 't', 'BCD'] },
    });
}());

// Rook
const bot3: BotDefinition = (function() {
    const MOVES: MoveSet = moveset({
        // Normal
        A: mStrike(5, 7, { height: StrikeHeight.Low, knockdown: true, armor: ArmorType.Medium }),
        C: mStrike(6, 5, { height: StrikeHeight.Low, armor: ArmorType.Medium }),
        D: mStrike(7, 4, { armor: ArmorType.Medium }),
        E: mStrike(8, 3, { height: StrikeHeight.High, armor: ArmorType.Medium }),
        F: mStrike(9, 2, { height: StrikeHeight.High, armor: ArmorType.Medium }),
        t: mThrow (12, 8),
        // Defense
        h: BLOCK_HIGH,
        l: BLOCK_LOW,
        d: mDodge(), // Instead of entangling vines
        // Special
        X: mStrike(6,  6, { blockDamage: 2 }),
        Y: mStrike(14, 5, { blockDamage: 1, armor: ArmorType.Heavy }), // Fully pumped, for free
        Z: mThrow (16, 9, { knockdown: false, armor: ArmorType.Light }),
        // Super
        1: mStrike(20, 12, { super: true, meter: 3, blockDamage: 3 }), // Fully pumped
        2: mThrow (50, 15, { super: true, meter: 3, knockdown: false }),
    });

    return bot(MOVES, {
        name: 'Colossus',
        difficulty: 3,
        normal: [
            { min: 5,  max: 6,  choices: ['l' , 'h' , 'l' , 'h' , 't' , 't'   , 'A'   , 'EF'  ], hitback: 't' },
            { min: 7,  max: 8,  choices: ['l' , 'h' , 'l' , 't' , 'Z' , 'AXD' , 'CDE' , 'EF'  ], hitback: 't' },
            { min: 9,  max: 10, choices: ['l' , 'h' , 'l' , 'h' , 't' , 'Z'   , 'Z'   , 'AXD' ], hitback: 'Z' },
            { min: 11, max: 12, choices: ['2' , '2' , '2' , '1' , 'Y' , 'dZ'  , 'dZ'  , 'EF'  ], hitback: '2' },
        ],
        knockdown: { choices: ['l', 'h', 'l', 't', 'Y'  , 'Y' , '1' , '1'] },
        wakeup:    { choices: ['l', 'h', 't', 't', 'CDE', 'EF', 'EF', 'Z'] },
    });
}());

// DeGrey
const bot4: BotDefinition = (function() {
    const MOVES: MoveSet = moveset({
        // Normal
        A: mStrike(4, 8, { height: StrikeHeight.Low }),
        B: mStrike(4, 7),
        D: mStrike(5, 6, { height: StrikeHeight.Low }),
        E: mStrike(6, 5, { height: StrikeHeight.Low }),
        F: mStrike(7, 4, { height: StrikeHeight.High }),
        t: mThrow (8, 4),
        // Defense
        h: BLOCK_HIGH,
        l: BLOCK_LOW,
        d: mDodge(),
        // Special
        X: mStrike    (7,  2, { blockDamage: 2, backstep: true }),
        Y: mStrike    (14, 1, { blockDamage: 4, backstep: true, knockdown: true, unsafe: true }),
        Z: mProjectile(1,  4, { blockDamage: 1, level: 2, edge: true, recur: false, lockdown: false }),
        // Super
        1: mDodge ({ super: true, meter: 0, recur: true }),
        2: mStrike(20, 11, { super: true, meter: 2, blockDamage: 2 }),
    });

    const S1DEF: ChoiceInit = ['1DEF', { always: false }];
    const S1EF2: ChoiceInit = ['1EF2', { always: false }];

    return bot(MOVES, {
        name: 'Twilight Baron',
        difficulty: 4,
        normal: [
            { min: 5,  max: 6,  choices: ['l'    , 'h'    , 'l'    , 't'   , 't'   , 'AB'    , 'AB'    , 'Y'     ], hitback: 't' },
            { min: 7,  max: 8,  choices: ['l'    , 'h'    , 'l'    , 't'   , 'YEF' , 'YEF'   , 'Y'     , 'Y'     ], hitback: 'Y' },
            { min: 9,  max: 10, choices: ['l'    , 'h'    , 'tDE'  , 'tDE' , 'YEF' , 'YEF'   , S1DEF   , 'ZDEF'  ], hitback: 'Y' },
            { min: 11, max: 12, choices: [S1EF2  , S1DEF  , 'tDE'  , 'tDE' , 'YEF' , 'YEF'   , '2'     , 'ZEF2'  ], hitback: '2' },
        ],
        knockdown: { choices: ['l', 'h', 'l', 'h', 't'  , 'EF' , '2'  , '2'  ] },
        wakeup:    { choices: ['l', 'h', 't', 't', 'EF' , 'FZF', 'FZF', 'YEF'] },
    });
}());

// Gloria
const bot6: BotDefinition = (function() {
    const MOVES: MoveSet = moveset({
        // Normal
        A: mStrike(3, 8, { height: StrikeHeight.High }),
        B: mStrike(4, 7, { height: StrikeHeight.Low }),
        D: mStrike(5, 6),
        E: mStrike(6, 5, { height: StrikeHeight.Low }),
        F: mStrike(7, 4),
        t: mThrow (6, 3),
        // Defense
        h: BLOCK_HIGH,
        l: BLOCK_LOW,
        d: mDodge(),
        // Special
        X: mProjectile(8, 7, { blockDamage: 4, knockdown: true }),
        Y: mStrike    (6, 5, { blockDamage: 2, pumpDamage: [7], knockdown: true, undodgeable: true }),
        Z: mStrike    (5, 7, { blockDamage: 2 }),
        // Super
        1: mStrike(31, 13, { super: true, meter: 4, blockDamage: 2, unsafe: true }),
        2: mStrike(10, 15, { super: true, meter: 1, blockDamage: 10, selfDamage: 10 }),
    });

    const BZ: ChoiceInit   = ['BZ'  , { adjust:  0 }];
    const ABZ: ChoiceInit  = ['ABZ' , { adjust: -1 }];
    const ABZF: ChoiceInit = ['ABZF', { adjust: -2 }];

    return bot(MOVES, {
        name: 'Soothing Monk',
        difficulty: 1,
        normal: [
            { min: 5,  max: 6,  choices: ['l'  , 'h'  , 'l'   , 't'   , 'AB'   ,  BZ     , 'X' , 'X'  ], hitback: 't' },
            { min: 7,  max: 8,  choices: ['l'  , 'h'  , 'l'   , 't'   ,  ABZ   , 'Y+E'  , 'X' , 'X'  ], hitback: 't' },
            { min: 9,  max: 10, choices: ['l'  , 'h'  , 'l'   , 'tDE' , 'Y+DE' , 'X'    , '2' , 'dt' ], hitback: 'Y+' },
            { min: 11, max: 12, choices: ['d1' , 'dt' , 'tEF' , 'tEF' , 'Y+DE' ,  ABZF  , '1' , '1'  ], hitback: '1' },
        ],
        knockdown: { choices: ['h', 't', 't', '2', '2' , '2', '2', '2' ] },
    });
}());

export const BOTS: BotDefinition[] = [
    bot1,
    bot2,
    bot3,
    bot4,
    bot6,
    bot7,
];