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
    desperate? : OverrideRow;
    wakeup?    : ChoiceRow;
    dragon?    : ChoiceRow;
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

export function modifyRow(row: ChoiceRow, change: (input: Choice) => Choice): ChoiceRow {
    return {
        choices: row.choices.map(c => {
            return change({ ...c });
        }),
        hitback: !row.hitback ? undefined : change({ ...row.hitback })
    };
}

export function modifyKnockdown(input: ChoiceRow): ChoiceRow {
    return modifyRow(input, c => {
        if (c.speed && c.speed < 10) {
            c.speed = 10;
        }
        return c;
    });
}

export function modifyEdge(input: ChoiceRow): ChoiceRow {
    return modifyRow(input, c => {
        if (c.speed && c.speed < 10) {
            c.speed = Math.min(c.speed + 3, 10);
        }
        return c;
    });
}

export function removeHandsizeChanges(input: ChoiceRow): ChoiceRow {
    return modifyRow(input, c => {
        c.adjust = 0;
        c.recur = false;
        c.draw = false;
        return c;
    });
}

export type BotShorthand = {
    name: string,
    difficulty: number,
    normal: Array<{
        min: number, max: number, choices: ChoiceInit[], hitback: ChoiceInit
    }>,
    knockdown: { choices: ChoiceInit[] },
    wakeup?: { choices: ChoiceInit[] },
    dragon?: { choices: ChoiceInit[], hitback: ChoiceInit },
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
        wakeup: init.wakeup ? modifyKnockdown({
            choices: init.wakeup.choices.map(moveParser),
        }) : undefined,
        dragon: init.dragon ? removeHandsizeChanges({
            choices: init.dragon.choices.map(moveParser),
            hitback: asHitback(moveParser(init.dragon.hitback)),
        }) : undefined,
    };
}
