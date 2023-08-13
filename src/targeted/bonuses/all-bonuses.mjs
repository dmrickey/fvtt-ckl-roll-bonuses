import { BaseBonus } from "./base-bonus.mjs";
import { ConditionalsBonus } from "./conditionals.mjs";
import { DamageBonus } from "./damage.mjs";

/**
 * @type {typeof BaseBonus[]}
 */
export const allBonuses = [
    ConditionalsBonus,
    DamageBonus,
];
