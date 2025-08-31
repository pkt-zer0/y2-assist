import { StrikeHeight } from './types.js';
import { BLOCK_HIGH, BLOCK_LOW } from './choices.js';
import {
    ChoiceInit,
    mDodge,
    moveset,
    MoveSet,
    mProjectile,
    mStrike,
    mThrow,
} from './moves.js';
import { bot, BotDefinition } from './bots_types.js';

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
        1: mStrike(20, 15, { super: true, blockDamage: 1, unsafe: true }),
        2: mDodge({ super: true, damage: 30 }),
    });

    const S1: ChoiceInit = ['1', { adjust: -2 }];
    const S2: ChoiceInit = ['2', { adjust: -2 }];

    return bot(MOVES, {
        name: 'Glass Monk',
        normal: [
            { min: 5,  max: 6,  choices: ['l' , 'h'  , 'l'   , 't'   , 'BZ'  , 'ZC'  , 'X'    , 'X' ], hitback: 't' },
            { min: 7,  max: 8,  choices: ['l' , 'h'  , 'l'   , 't'   , 'ABC' , 'Y'   , 'X'    , 'X' ], hitback: 'Y' },
            { min: 9,  max: 10, choices: ['l' , 'h'  , 'l'   , 'tCD' , 'tCD' , 'ABCX', 'ABCX' , 'dt'], hitback: 'Y' },
            { min: 11, max: 12, choices: [S2  , 'dt' , 'tDE' , 'tDE' , 'ABCX', 'Y'   , S1     , S1  ], hitback: S1  },
        ],
        knockdown: { choices: ['h', 't', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'] },
        desperate: { choices: [null, null, null, null, S1, S1, S1, S1] },
    });
}());

export const BOTS: Record<string, BotDefinition> = {
    M1: bot1,
};