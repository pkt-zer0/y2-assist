export enum MoveType {
    Dodge,
    Throw,
    // Attacks
    Strike,
    Projectile,
    // Blocks
    BlockLow,
    BlockHigh,
}

export enum StrikeHeight {
    Low, Mid, High
}

export interface MoveChoice {
    type        : MoveType;
    damage      : number;
    blockDamage : number;
    firstDamage : number;
    speed       : number;
    adjust      : number;
    level       : number; // Projectiles only
    height      : StrikeHeight;
    description : string;

    // Various optional flags
    recur?      : boolean  // draw if not hit
    drawOnBlock?: boolean; // draw if strike blocked
    knockdown?  : boolean;
    edge?       : boolean;
    lockdown?   : boolean; // prevent draw on block
    super?      : boolean;
    unsafe?     : boolean; // hit back if blocked
    always?     : boolean; // adjust handsize even if whiffed
}

/* Move description shorthand (case sensitive):
  - A..J : normals
  - t, l, h, b, d: throw, low/high/full block, dodge
  - 1, 2 : super 1/2
  - !, ? : ability, gem ability
  - S, U : gem special, burst
*/

//region Move defaults and factory methods

export const MOVE_DEFAULTS = {
    adjust: 0,
    damage: 0,
    speed: 0,
    level: 0,
    blockDamage: 0,
    firstDamage: 0,
    description: '',
    height: StrikeHeight.Mid,
};

export const BLOCK_LOW: MoveChoice = {
    ...MOVE_DEFAULTS,
    type: MoveType.BlockLow,
    drawOnBlock: true,
    recur: true,
};
export const BLOCK_HIGH: MoveChoice = {
    ...MOVE_DEFAULTS,
    type: MoveType.BlockHigh,
    drawOnBlock: true,
    recur: true,
};

export function mThrow(
    damage: number, speed: number, overrides: Partial<MoveChoice> = {}
): MoveChoice {
    return {
        ...MOVE_DEFAULTS,
        type: MoveType.Throw,
        damage,
        speed,
        description: 't',
        knockdown: true,
        ...overrides,
    };
}
export function mStrike(
    damage: number, speed: number, overrides: Partial<MoveChoice> = {}
): MoveChoice {
    return {
        ...MOVE_DEFAULTS,
        type: MoveType.Strike,
        damage,
        speed,
        ...overrides,
    };
}
export function mProjectile(
    damage: number, speed: number, overrides: Partial<MoveChoice> = {}
): MoveChoice {
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
export function mDodge(
    damage: number, overrides: Partial<MoveChoice> = {}
): MoveChoice {
    return {
        ...MOVE_DEFAULTS,
        type: MoveType.Dodge,
        description: 'd',
        damage,
        ...overrides,
    };
}

//endregion
