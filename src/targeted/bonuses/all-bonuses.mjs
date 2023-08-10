import { BaseBonus } from "./base-bonus.mjs";
import { DamageBonus } from "./damage.mjs";

/**
 * @type {typeof BaseBonus[]}
 */
export const allBonuses = [
    DamageBonus,
];
