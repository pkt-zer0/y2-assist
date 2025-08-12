import { bot1 } from './bots.js';
import {
    ChoiceInit,
    mDodge,
    mStrike,
    MoveSet,
    mProjectile,
    mThrow,
    parseMove,
    moveset,
} from './moves.js';
import { BLOCK_HIGH, BLOCK_LOW, StrikeHeight } from './types.js';

//-- Utils --

function compareObj(actual: {}, expected: {}): string[] {
    const allKeys = [...Object.keys(actual), ...Object.keys(expected)];

    const diffs = {}; // Could be a Set, but whatever
    for (const key of allKeys) {
        // Treat missing keys as a flag set to false
        if ((actual[key] ?? false) !== (expected[key] ?? false)) {
            diffs[key] = true;
        }
    }

    return Object.keys(diffs);
}

//-- Parsing test --

const MOVES_BOT1: MoveSet = moveset({
    // Normal
    A: mStrike(3, 8, { height: StrikeHeight.Low  }),
    B: mStrike(4, 7, { height: StrikeHeight.Low  }),
    C: mStrike(5, 6),
    D: mStrike(6, 5, { height: StrikeHeight.High }),
    E: mStrike(7, 4, { height: StrikeHeight.High }),
    t: mThrow  (7, 5),
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
const shortForm: ChoiceInit[][] = [
    ['l' , 'h'  , 'l'   , 't'   , 'BZ'  , 'ZC'  , 'X'    , 'X' ],
    ['l' , 'h'  , 'l'   , 't'   , 'ABC' , 'Y'   , 'X'    , 'X' ],
    ['l' , 'h'  , 'l'   , 'tCD' , 'tCD' , 'ABCX', 'ABCX' , 'dt'],
    [S2  , 'dt' , 'tDE' , 'tDE' , 'ABCX', 'Y'   , S1     , S1 ],
];

function checkParser() {
    for (let rowIndex = 0; rowIndex < shortForm.length; rowIndex ++) {
        const shortRow = shortForm[rowIndex];
        const longRow = bot1.normal[rowIndex];

        for (let choiceIndex = 0; choiceIndex < longRow.choices.length; choiceIndex++) {
            const actual = parseMove(shortRow[choiceIndex], MOVES_BOT1);
            const expected = longRow.choices[choiceIndex];

            const diffs = compareObj(expected, actual);
            if (diffs.length) {
                console.log(`Mismatch in row ${rowIndex}, choice ${choiceIndex}: ${diffs.join(', ')}`);
                console.log(expected);
                console.log(actual);
                return;
            }
        }
    }
}

checkParser();