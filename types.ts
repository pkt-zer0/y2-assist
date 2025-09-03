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

interface CommonMoveProps {
    type        : MoveType;
    damage      : number;
    blockDamage : number;
    speed       : number;
    level       : number; // Projectiles only
    height      : StrikeHeight;

    // Various optional flags
    recur?      : boolean  // draw if not hit
    drawOnBlock?: boolean; // draw if strike blocked
    knockdown?  : boolean;
    edge?       : boolean;
    lockdown?   : boolean; // prevent draw on block
    super?      : boolean;
    unsafe?     : boolean; // hit back if blocked
    backstep?   : boolean; // beats normal/special of speed 8+
}

export interface Move extends CommonMoveProps {
    pumpDamage  : number[];
    meter       : number; // super meter used
}

export interface Choice extends CommonMoveProps {
    description : string;
    firstDamage : number;
    adjust      : number;
    always?     : boolean; // adjust handsize even if whiffed
}

/* Move description shorthand (case sensitive):
  - A..J : normals
  - t, l, h, b, d: throw, low/high/full block, dodge
  - 1, 2 : super 1/2
  - !, ? : ability, gem ability
  - S, U : gem special, burst
*/
