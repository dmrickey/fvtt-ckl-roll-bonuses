import { ActionTarget } from "./have-to-do/action-target.mjs";
import { AlignmentTarget } from './conditional/alignment-target.mjs';
import { DamageTypeTarget } from "./damage-type-target.mjs";
import { IsMeleeTarget } from './item-filter-target.mjs/is-melee-target.mjs';
import { IsRangedTarget } from './item-filter-target.mjs/is-ranged-target.mjs';
import { IsSpellTarget } from "./item-filter-target.mjs/is-spell-target.mjs";
import { IsWeaponTarget } from './item-filter-target.mjs/is-weapon-target.mjs';
import { ItemTarget } from "./specific-item-target/item-target.mjs";
import { SelfTarget } from './self-target.mjs';
import { SpellTarget } from "./specific-item-target/spell-target.mjs";
import { TokenTarget } from "./conditional/token-target.mjs";
import { WeaponGroupTarget } from "./weapon-group-target.mjs";
import { WeaponTarget } from "./specific-item-target/weapon-target.mjs";
import { WeaponTypeTarget } from "./weapon-type-target.mjs";
import { AllTarget } from './conditional/all-target.mjs';
import { FinesseTarget } from './finesse-target.mjs';
import { FunctionTarget } from './function-target.mjs';
import { SpellSchoolTarget } from './spell-school-target.mjs';
import { Sources } from '../source-registration.mjs';
import { WhenActiveTarget } from './conditional/when-active-target.mjs';
import { HasBooleanFlagTarget } from './conditional/has-boolean-flag-target.mjs';
import { WhenInCombatTarget } from './conditional/when-in-combat-target.mjs';
import { WhenTargetInRange } from './conditional/is-target-within-range.mjs';
import { SpellDescriptorTarget } from './spell-descriptor-target.mjs';

export const registerTargets = () => [
    AlignmentTarget,
    AllTarget,
    DamageTypeTarget,
    FinesseTarget,
    FunctionTarget,
    HasBooleanFlagTarget,
    IsMeleeTarget,
    IsRangedTarget,
    IsSpellTarget,
    IsWeaponTarget,
    ItemTarget,
    SelfTarget,
    SpellDescriptorTarget,
    SpellSchoolTarget,
    SpellTarget,
    TokenTarget,
    WeaponGroupTarget,
    WeaponTarget,
    WeaponTypeTarget,
    WhenActiveTarget,
    WhenInCombatTarget,
    WhenTargetInRange,

    // todo later
    // ActionTarget,
].forEach(Sources.registerSource);
