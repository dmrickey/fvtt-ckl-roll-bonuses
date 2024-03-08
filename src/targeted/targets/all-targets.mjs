import { ActionTarget } from "./have-to-do/action-target.mjs";
import { BaseTarget } from "./base-target.mjs";
import { DamageTypeTarget } from "./have-to-do/damage-type-target.mjs";
import { IsMeleeWeaponTarget } from './is-melee-weapon-target.mjs';
import { IsRangedWeaponTarget } from './is-ranged-weapon-target.mjs';
import { ItemTarget } from "./item-target.mjs";
import { SpellTarget } from "./spell-target.mjs";
import { TokenTarget } from "./token-target.mjs";
import { WeaponGroupTarget } from "./weapon-group-target.mjs";
import { WeaponTarget } from "./weapon-target.mjs";
import { WeaponTypeTarget } from "./weapon-type-target.mjs";

/** @type {typeof BaseTarget[]} */
export const allTargetTypes = [
    // ActionTarget,
    // DamageTypeTarget,
    ItemTarget,
    IsMeleeWeaponTarget,
    IsRangedWeaponTarget,
    SpellTarget,
    TokenTarget,
    WeaponGroupTarget,
    WeaponTarget,
    WeaponTypeTarget,
];
