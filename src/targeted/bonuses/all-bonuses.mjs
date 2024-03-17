import { BaseBonus } from "./base-bonus.mjs";
import { DamageBonus } from "./damage-bonus.mjs";
import { AttackBonus } from "./attack-bonus.mjs";
import { EffectiveSizeBonus } from './effective-size.mjs';

/**
 * @type {typeof BaseBonus[]}
 */
export const allBonusTypes = [
    AttackBonus,
    DamageBonus,
    EffectiveSizeBonus,
    // ModifiersBonus, // only if I can get the function to remove duplicates working (which needs to work with conditionals)
];
