import { ActionTarget } from "./have-to-do/action-target.mjs";
import { BaseTarget } from "./base-target.mjs";
import { DamageTypeTarget } from "./have-to-do/damage-type-target.mjs";
import { ItemTarget } from "./item-target.mjs";
import { WeaponGroupTarget } from "./weapon-group-target.mjs";
import { WeaponTypeTarget } from "./weapon-type-target.mjs";
import { SpellTarget } from "./spell-target.mjs";
import { WeaponTarget } from "./weapon-target.mjs";
import { TokenTarget } from "./token-target.mjs";

/** @type {typeof BaseTarget[]} */
export const allTargetTypes = [
    // ActionTarget,
    // DamageTypeTarget,
    ItemTarget,
    SpellTarget,
    TokenTarget,
    WeaponGroupTarget,
    WeaponTarget,
    WeaponTypeTarget,
];
