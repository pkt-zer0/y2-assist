import { Choice, MoveType } from './types.js';
import { MOVE_DEFAULTS, mStrike, mThrow, mProjectile, mDodge } from './moves.js';

export const CHOICE_DEFAULTS = {
    description: '',
    firstDamage: 0,
    adjust: 0,
};

export const BLOCK_LOW: Choice = {
    ...MOVE_DEFAULTS,
    ...CHOICE_DEFAULTS,
    type: MoveType.BlockLow,
    drawOnBlock: true,
    recur: true,
};
export const BLOCK_HIGH: Choice = {
    ...MOVE_DEFAULTS,
    ...CHOICE_DEFAULTS,
    type: MoveType.BlockHigh,
    drawOnBlock: true,
    recur: true,
};

export function cThrow(
    damage: number, speed: number, overrides: Partial<Choice> = {}
): Choice {
    return {
        ...mThrow(damage, speed),
        ...CHOICE_DEFAULTS,
        description: 't',
        ...overrides,
    };
}
export function cStrike(
    damage: number, speed: number, overrides: Partial<Choice> = {}
): Choice {
    return {
        ...mStrike(damage, speed),
        ...CHOICE_DEFAULTS,
        ...overrides,
    };
}
export function cProjectile(
    damage: number, speed: number, overrides: Partial<Choice> = {}
): Choice {
    return {
        ...mProjectile(damage, speed),
        ...CHOICE_DEFAULTS,
        ...overrides,
    };
}
export function cDodge(
    damage: number, overrides: Partial<Choice> = {}
): Choice {
    return {
        ...mDodge(),
        ...CHOICE_DEFAULTS,
        damage,
        description: 'd',
        ...overrides,
    };
}
