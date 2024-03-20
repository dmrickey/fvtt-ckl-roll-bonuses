import { ActionTarget } from "./have-to-do/action-target.mjs";
import { AlignmentTarget } from './alignment-target.mjs';
import { BaseTarget } from "./base-target.mjs";
import { DamageTypeTarget } from "./have-to-do/damage-type-target.mjs";
import { IsMeleeTarget } from './is-melee-target.mjs';
import { IsRangedTarget } from './is-ranged-target.mjs';
import { IsSpellTarget } from "./is-spell-target.mjs";
import { IsWeaponTarget } from './is-weapon-target.mjs';
import { ItemTarget } from "./item-target.mjs";
import { SelfTarget } from './self-target.mjs';
import { SpellTarget } from "./spell-target.mjs";
import { TokenTarget } from "./token-target.mjs";
import { WeaponGroupTarget } from "./weapon-group-target.mjs";
import { WeaponTarget } from "./weapon-target.mjs";
import { WeaponTypeTarget } from "./weapon-type-target.mjs";

/** @type {typeof BaseTarget[]} */
export const allTargetTypes = [
    AlignmentTarget,
    IsMeleeTarget,
    IsRangedTarget,
    IsSpellTarget,
    IsWeaponTarget,
    ItemTarget,
    SelfTarget,
    SpellTarget,
    TokenTarget,
    WeaponGroupTarget,
    WeaponTarget,
    WeaponTypeTarget,

    // todo later
    // ActionTarget,
    // DamageTypeTarget,
];
