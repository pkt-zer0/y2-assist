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

// Built-in flags
export const FLAG_DEFS = {
    unsafe     : { icon: `⚠`,           desc: `Unsafe on block`},
    edge       : { icon: `⊕`,           desc: `Edge on block or hit`},

    knockdown  : { icon: `KD`,          desc: `Knockdown on hit`},
    recur      : { icon: `RECUR`,       desc: `+1 handsize if not hit`},
    lockdown   : { icon: `LOCK`,        desc: `Prevent draw from block`},
    draw       : { icon: `DRAW`,        desc: `+1 handsize if blocked a strike`},
    backstep   : { icon: `STEP`,        desc: `Beats normal/special strikes of speed 8 or higher`},
    undodgeable: { icon: `CAN'T DODGE`, desc: `Cannot be dodged`},
    unblockable: { icon: `CAN'T BLOCK`, desc: `Cannot be blocked`},
    freeze     : { icon: `FREEZE`,      desc: `If this hits on the bot's turn, skip your next main phase`},
    oblivion   : { icon: `BREAK`,       desc: `If this hits, remove a random discarded card from the game`},
    transform  : { icon: `DRAGON`,      desc: `Transforms into a dragon`},
};
export type FlagNames = keyof typeof FLAG_DEFS;
export const FLAG_NAMES = Object.keys(FLAG_DEFS) as FlagNames[];

// Flags that are not just a true/false boolean. Should probably be rolled into "regular" flags
const armorComment = ` <br> (If your faster attack hits the bot's armored attack, your attack can't combo, pump, or knock the bot down. Then the bot's attack hits you.)`;
export const SPECIAL_FLAGS = {
    armorL: { icon: `[L]`, desc: `Has armor versus A, B, C normal attacks.` + armorComment },
    armorM: { icon: `[M]`, desc: `Has armor versus normal attacks.` + armorComment },
    armorH: { icon: `[H]`, desc: `Has armor versus normal and special attacks.` + armorComment },

    selfDamage: { icon: `(X) SELF DMG`,  desc: `The bot takes (X) damage` },
    selfHeal:   { icon: `(X) SELF HEAL`, desc: `The bot heals (X) damage` },
};
export type SpecialFlagNames = keyof typeof SPECIAL_FLAGS;
export type UsedFlagNames = SpecialFlagNames | FlagNames;

export const ALL_FLAG_DEFS = {
    ...FLAG_DEFS,
    ...SPECIAL_FLAGS,
};
export const ALL_FLAG_NAMES = Object.keys(ALL_FLAG_DEFS) as UsedFlagNames[];

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
    super?      : boolean;

    // Various optional flags
    recur?      : boolean  // draw if not hit
    draw?       : boolean; // draw if strike blocked
    knockdown?  : boolean;
    edge?       : boolean;
    lockdown?   : boolean; // prevent draw on block
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
