import { ActionTarget } from "./action-target.mjs";
import { AlignmentTarget } from './conditional/alignment-target.mjs';
import { AllTarget } from './conditional/all-target.mjs';
import { ConditionTarget } from './conditional/condition-target.mjs';
import { DamageTypeTarget } from "./damage-type-target.mjs";
import { FinesseTarget } from './finesse-target.mjs';
import { FunctionTarget } from './function-target.mjs';
import { HasBooleanFlagTarget } from './conditional/has-boolean-flag-target.mjs';
import { IsMeleeTarget } from './item-filter-target.mjs/is-melee-target.mjs';
import { IsNaturalSecondaryTarget } from './item-filter-target.mjs/is-natural-secondary-target.mjs';
import { IsNaturalTarget } from './item-filter-target.mjs/is-natural-target.mjs';
import { IsRangedTarget } from './item-filter-target.mjs/is-ranged-target.mjs';
import { IsSpellTarget } from "./item-filter-target.mjs/is-spell-target.mjs";
import { IsThrownTarget } from './item-filter-target.mjs/is-thrown-target.mjs';
import { IsWeaponTarget } from './item-filter-target.mjs/is-weapon-target.mjs';
import { SelfTarget } from './self-target.mjs';
import { Sources } from '../source-registration.mjs';
import { SpecificItemTarget } from "./specific-item-target/specific-item-target.mjs";
import { SpellDescriptorTarget } from './spell-descriptor-target.mjs';
import { SpellSchoolTarget } from './spell-school-target.mjs';
import { SpellTarget } from "./specific-item-target/spell-target.mjs";
import { TokenTarget } from "./conditional/token-target.mjs";
import { WeaponGroupTarget } from "./weapon-group-target.mjs";
import { WeaponTarget } from "./specific-item-target/weapon-target.mjs";
import { WeaponTypeTarget } from "./weapon-type-target.mjs";
import { WhenActiveTarget } from './conditional/when-active-target.mjs';
import { WhenInCombatTarget } from './conditional/when-in-combat-target.mjs';
import { WhenTargetInRange } from './conditional/is-target-within-range.mjs';
import { ActionTypeTarget } from './action-type-target.mjs';

export const registerTargets = () => [
    ActionTarget,
    ActionTypeTarget,
    AlignmentTarget,
    AllTarget,
    ConditionTarget,
    DamageTypeTarget,
    FinesseTarget,
    FunctionTarget,
    HasBooleanFlagTarget,
    IsMeleeTarget,
    IsNaturalSecondaryTarget,
    IsNaturalTarget,
    IsRangedTarget,
    IsSpellTarget,
    IsThrownTarget,
    IsWeaponTarget,
    SelfTarget,
    SpecificItemTarget,
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
].forEach(Sources.registerSource);
