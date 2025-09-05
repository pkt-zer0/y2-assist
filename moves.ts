import { ArmorType, Choice, Move, MoveType, StrikeHeight } from './types.js';

interface NamedMove extends Move {
    name: string;
}

// Explicit definition, move list, or move list with overrides
export type ChoiceInit = Choice | string | [string, Partial<Choice>];

export type MoveSet = Record<string, NamedMove>;

//-- Move creation helpers --

export const MOVE_DEFAULTS = {
    damage: 0,
    speed: 0,
    level: 0,
    blockDamage: 0,
    pumpDamage: [],
    meter: 0,
    height: StrikeHeight.Mid,
    armor: ArmorType.None,
};

export const BLOCK_LOW: Move = {
    ...MOVE_DEFAULTS,
    type: MoveType.BlockLow,
    drawOnBlock: true,
    recur: true,
};
export const BLOCK_HIGH: Move = {
    ...MOVE_DEFAULTS,
    type: MoveType.BlockHigh,
    drawOnBlock: true,
    recur: true,
};

export function mStrike(
    damage: number, speed: number, overrides: Partial<Move> = {}
): Move {
    return {
        ...MOVE_DEFAULTS,
        type: MoveType.Strike,
        damage,
        speed,
        ...overrides,
    };
}
export function mThrow(
    damage: number, speed: number, overrides: Partial<Move> = {}
): Move {
    return {
        ...MOVE_DEFAULTS,
        type: MoveType.Throw,
        damage,
        speed,
        knockdown: true,
        ...overrides,
    };
}
export function mProjectile(
    damage: number, speed: number, overrides: Partial<Move> = {}
): Move {
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
export function mDodge(overrides: Partial<Move> = {}): Move {
    return {
        ...MOVE_DEFAULTS,
        type: MoveType.Dodge,
        ...overrides,
    };
}

//-- Parsing --

export function moveset(def: Record<string, Move>): MoveSet {
    const namedMoves: MoveSet = {};
    for (let name in def) {
        const move = def[name];
        namedMoves[name] = { name, ...move };
    }
    return namedMoves;
}

function convertShorthand(moveset: MoveSet, moveString: string, overrides: Partial<Choice>): Choice {
    const moves = moveString
        .split('')
        .filter(c => c !== '+')
        .map(name => moveset[name]);

    const first = moves[0];
    const last  = moves[moves.length - 1];

    const hasFollowup = moves.length > 1;
    const description = hasFollowup
        ? [moveString[0], ' → ', moveString.slice(1)].join('')
        : moveString[0];
    const skipDescription = (
        first.type == MoveType.BlockHigh
        ||  first.type == MoveType.BlockLow
    );

    let totalDamage = 0;
    let lastMove: NamedMove | null = null;
    let pumpCount = -1;
    let totalAdjust = 0;
    for (let moveIndex = 0; moveIndex < moveString.length; moveIndex += 1) {
        const moveChar = moveString[moveIndex];
        const move = moveset[moveChar];

        // Update damage
        if (moveChar !== '+') {
            // Regular move
            totalDamage += move.damage;

            // Reset pump data
            lastMove = move;
            pumpCount = -1;
        } else {
            // Pump last move
            pumpCount += 1;

            if (!lastMove) {
                throw Error('Pump symbol must follow a move');
            }
            if (pumpCount >= lastMove.pumpDamage.length) {
                throw Error(`Move ${lastMove.name} cannot be pumped ${pumpCount + 1} times`);
            }

            totalDamage += lastMove.pumpDamage[pumpCount];
        }

        // Update handsize adjustment
        totalAdjust += move?.super
            ? move.meter // Super moves always cost meter
            : (moveIndex === 0 ? 0 : 1); // First card is free!
    }

    return {
        // Determined by first move
        type       : first.type,
        blockDamage: first.blockDamage,
        speed      : first.speed,
        level      : first.level,
        height     : first.height,
        recur      : first.recur,
        drawOnBlock: first.drawOnBlock,
        lockdown   : first.lockdown,
        super      : first.super,
        unsafe     : first.unsafe,
        always     : first.super,
        backstep   : first.backstep,
        armor      : first.armor,

        // Determined by last move
        knockdown: last.knockdown,
        edge     : last.edge,

        // Determined by combo
        damage     : totalDamage,
        adjust     : -totalAdjust,
        description: skipDescription ? '' : description,
        firstDamage: hasFollowup ? first.damage : 0,

        // Allow explicit overrides
        ...overrides,
    };
}

export function parseMove(shorthand: ChoiceInit, moveset: MoveSet): Choice {
    // Move list with override
    if (Array.isArray(shorthand)) {
        const [moveString, overrides] = shorthand;
        return convertShorthand(moveset, moveString, overrides);
    }
    // Move list
    if (typeof shorthand === 'string') {
        return convertShorthand(moveset, shorthand, {});
    }
    // Explicit choice
    if (typeof shorthand === 'object') {
        return shorthand;
    }
    throw RangeError('Invalid shorthand descriptor: ' + shorthand);
}

/** Hitback moves are a bit different, apply adjustments here */
export function asHitback(original: Choice): Choice {
    const hitback: Choice = {
        ...original,
        // Remove data irrelevant for hitback
        always: false,
        unsafe: false,
        backstep: false,
        recur: false,
        lockdown: false,
        speed: 0,
        blockDamage: 0,
        firstDamage: 0,
    };
    // Normal moves count as an extra card spent, super moves only consider meter
    if (!hitback.super) {
        hitback.adjust -= 1;
    }
    return hitback;
}
