import { Move, MOVE_DEFAULTS, Choice, MoveType } from './types.js';

interface NamedMove extends Move {
    name: string;
}

// Explicit definition, move list, or move list with overrides
export type ChoiceInit = Choice | string | [string, Partial<Choice>];

export type MoveSet = Record<string, NamedMove>;

function sumBy<T>(items: T[], selector: (obj: T) => number) {
    return items.map(selector).reduce((acc, cur) => acc + cur);
}

//-- Move creation helpers --

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

function choiceFromMoves(moves: NamedMove[], overrides: Partial<Choice> = {}): Choice {
    const first = moves[0];
    const last  = moves[moves.length - 1];

    const hasFollowup = moves.length > 1;
    const description = hasFollowup
        ? [first.name, ' → ', moves.slice(1).map(_ => _.name).join('')].join('')
        : first.name;
    const skipDescription = (
        first.type == MoveType.BlockHigh
        ||  first.type == MoveType.BlockLow
    );

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

        // Determined by last move
        knockdown: last.knockdown,
        edge     : last.edge,

        // Determined by combo
        damage     : sumBy(moves, _ => _.damage),
        adjust     : -(moves.length - 1),
        description: skipDescription ? '' : description,
        firstDamage: hasFollowup ? first.damage : 0,

        // Allow explicit overrides
        ...overrides,
    };
}

function convertShorthand(moveset: MoveSet, moveString: string, overrides: Partial<Choice>) {
    const named = moveString.split('').map(name => moveset[name]);
    return choiceFromMoves(named, overrides);
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
