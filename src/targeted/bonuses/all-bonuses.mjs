import { BaseBonus } from "./base-bonus.mjs";
import { DamageBonus } from "./damage-bonus.mjs";
import { AttackBonus } from "./attack-bonus.mjs";
import { EffectiveSizeBonus } from './effective-size.mjs';
import { FortuneBonus } from './fortune-bonus.mjs';
import { MisfortuneBonus } from './misfortune-bonus.mjs';
import { CritBonus } from './crit-bonus.mjs';
import { WeaponFinesseBonus } from './weapon-finesse-bonus.mjs';
import { AgileBonus } from './agile.mjs';

/**
 * @type {typeof BaseBonus[]}
 */
export const allBonusTypes = [
    AgileBonus,
    AttackBonus,
    CritBonus,
    DamageBonus,
    EffectiveSizeBonus,
    FortuneBonus,
    MisfortuneBonus,
    WeaponFinesseBonus,
    // ModifiersBonus, // only if I can get the function to remove duplicates working (which needs to work with conditionals)
];
