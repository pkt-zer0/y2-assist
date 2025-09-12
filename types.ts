export enum MoveType {
    Dodge,
    Throw,
    // Attacks
    Strike,
    Projectile,
    // Blocks
    BlockLow,
    BlockHigh,
    BlockFull,
}

export enum StrikeHeight {
    Low, Mid, High
}

export enum ArmorType {
    None,
    Light,  // vs ABC normals
    Medium, // vs Normal
    Heavy,  // vs Normal and Special
}

interface CommonMoveProps {
    type        : MoveType;
    damage      : number;
    blockDamage : number;
    selfDamage  : number;
    selfHeal    : number;
    speed       : number;
    level       : number; // Projectiles only
    height      : StrikeHeight;
    armor       : ArmorType;

    // Various optional flags
    recur?      : boolean  // draw if not hit
    drawOnBlock?: boolean; // draw if strike blocked
    knockdown?  : boolean;
    edge?       : boolean;
    lockdown?   : boolean; // prevent draw on block
    super?      : boolean;
    unsafe?     : boolean; // hit back if blocked
    backstep?   : boolean; // beats normal/special of speed 8+
    undodgeable?: boolean;
    unblockable?: boolean;
    freeze?     : boolean;
    oblivion?   : boolean;
    transform?  : boolean;
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
