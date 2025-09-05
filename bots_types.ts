import { Choice } from './types.js';
import { asHitback, ChoiceInit, MoveSet, parseMove } from './moves.js';

interface HandSizeRange {
    minHand: number;
    maxHand: number;
}

export type ChoiceRow = {
    /** Index corresponds to the dice roll needed */
    choices: Choice[];
    hitback?: Choice;
}
export type OverrideRow = {
    choices: Array<Choice | null>;
    hitback?: Choice;
}

type MoveChoiceRow = HandSizeRange & ChoiceRow;
export interface BotDefinition {
    name       : string;
    difficulty : number;
    normal     : MoveChoiceRow[];
    knockdown  : ChoiceRow;
    desperate? : OverrideRow
    wakeup?    : ChoiceRow;
}

export function applyOverride(base: ChoiceRow, override: OverrideRow): ChoiceRow {
    const choices = override.choices.map((c, i) => {
        return c ?? base.choices[i];
    });

    return {
        choices,
        hitback: override.hitback ?? base.hitback
    };
}

export type BotShorthand = {
    name: string,
    difficulty: number,
    normal: Array<{
        min: number, max: number, choices: ChoiceInit[], hitback: ChoiceInit
    }>,
    knockdown: { choices: ChoiceInit[] },
    wakeup?: { choices: ChoiceInit[] },
    desperate?: { choices: Array<null | ChoiceInit> },
};


export function bot(moveset: MoveSet, init: BotShorthand): BotDefinition {
    const moveParser = (c: ChoiceInit) => parseMove(c, moveset);
    const overrideParser = (c: ChoiceInit | null) => c === null ? null : parseMove(c, moveset);

    return {
        name: init.name,
        difficulty: init.difficulty,
        normal: init.normal.map(i => ({
            minHand: i.min,
            maxHand: i.max,
            choices: i.choices.map(moveParser),
            hitback: asHitback(moveParser(i.hitback)),
        })),
        knockdown: {
            choices: init.knockdown.choices.map(moveParser),
        },
        desperate: init.desperate ? {
            choices: init.desperate.choices.map(overrideParser),
        } : undefined,
        wakeup: init.wakeup ? {
            choices: init.wakeup.choices.map(moveParser),
        } : undefined,
    };
}
