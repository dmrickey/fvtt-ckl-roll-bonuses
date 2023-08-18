import { BaseBonus } from "./base-bonus.mjs";
import { ModifiersBonus } from "./modifiers.mjs";
import { DamageBonus } from "./damage.mjs";
import { AttackBonus } from "./attack.mjs";

/**
 * @type {typeof BaseBonus[]}
 */
export const allBonusTypes = [
    AttackBonus,
    DamageBonus,
    // ModifiersBonus, // only if I can get the function to remove duplicates working (which needs to work with conditionals)
];
