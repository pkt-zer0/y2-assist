import { Choice } from './types.js';
import { ChoiceInit, MoveSet, parseMove } from './moves.js';

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
    name: string;
    normal: MoveChoiceRow[];
    knockdown: ChoiceRow;
    desperate: OverrideRow
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
    normal: Array<{
        min: number, max: number, choices: ChoiceInit[], hitback: ChoiceInit
    }>,
    knockdown: { choices: ChoiceInit[] },
    desperate: { choices: Array<null | ChoiceInit> },
};

export function bot(moveset: MoveSet, init: BotShorthand): BotDefinition {
    const moveParser = (c: ChoiceInit) => parseMove(c, moveset);
    const overrideParser = (c: ChoiceInit | null) => c === null ? null : parseMove(c, moveset);

    return {
        name: init.name,
        normal: init.normal.map(i => {
            const hitback = {
                ...moveParser(i.hitback),
                // Remove data irrelevant for hitback
                always: false,
                unsafe: false,
                speed: 0,
                blockDamage: 0,
            };
            // Normal moves count as an extra card spent, super moves only consider meter
            if (!hitback.super) {
                hitback.adjust -= 1;
            }

            return ({
                minHand: i.min,
                maxHand: i.max,
                choices: i.choices.map(moveParser),
                hitback: hitback,
            });
        }),
        knockdown: {
            choices: init.knockdown.choices.map(moveParser),
        },
        desperate: {
            choices: init.desperate.choices.map(overrideParser),
        }
    };
}
