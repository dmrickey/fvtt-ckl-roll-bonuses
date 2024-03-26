import { AgileBonus } from './agile.mjs';
import { AttackBonus } from "./attack-bonus.mjs";
import { BaseBonus } from "./base-bonus.mjs";
import { CasterLevelBonus } from './caster-level-bonus.mjs';
import { CritBonus } from './crit-bonus.mjs';
import { DamageBonus } from "./damage-bonus.mjs";
import { DCBonus } from './dc-bonus.mjs';
import { EffectiveSizeBonus } from './effective-size.mjs';
import { FinesseBonus as FinesseBonus } from './finesse-bonus.mjs';
import { FortuneBonus } from './fortune-bonus.mjs';
import { MisfortuneBonus } from './misfortune-bonus.mjs';

/**
 * @type {typeof BaseBonus[]}
 */
export const allBonusTypes = [
    AgileBonus,
    AttackBonus,
    CasterLevelBonus,
    CritBonus,
    DamageBonus,
    DCBonus,
    EffectiveSizeBonus,
    FinesseBonus,
    FortuneBonus,
    MisfortuneBonus,
    // ModifiersBonus, // only if I can get the function to remove duplicates working (which needs to work with conditionals)
];
