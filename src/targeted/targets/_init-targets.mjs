import { ActionTarget } from "./action-target.mjs";
import { ActionTypeTarget } from './action-type-target.mjs';
import { AlignmentTarget } from './conditional/alignment-target.mjs';
import { AllTarget } from './all-target.mjs';
import { ConditionTarget } from './conditional/condition-target.mjs';
import { DamageTypeTarget } from "./damage-type-target.mjs";
import { FinesseTarget } from './finesse-target.mjs';
import { FunctionTarget } from './function-target.mjs';
import { HasBooleanFlagTarget } from './conditional/has-boolean-flag-target.mjs';
import { RaceSubtypeTarget } from './conditional/race-subtype-target.mjs';
import { RaceTarget } from './conditional/race-target.mjs';
import { SelfTarget } from './self-target.mjs';
import { Sources } from '../source-registration.mjs';
import { SpecificItemTarget } from "./specific-item-target/specific-item-target.mjs";
import { SpellDescriptorTarget } from './spell-descriptor-target.mjs';
import { SpellSchoolTarget } from './spell-school-target.mjs';
import { SpellSubschoolTarget } from './spell-subschool-target.mjs';
import { SpellTarget } from "./specific-item-target/spell-target.mjs";
import { TokenTarget } from "./conditional/token-target.mjs";
import { WeaponGroupTarget } from "./weapon-group-target.mjs";
import { WeaponTarget } from "./specific-item-target/weapon-target.mjs";
import { WeaponTypeTarget } from "./weapon-type-target.mjs";
import { WhenActiveTarget } from './conditional/when-active-target.mjs';
import { WhenInCombatTarget } from './conditional/when-in-combat-target.mjs';
import { WhenTargetInRange } from './conditional/is-target-within-range.mjs';

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
    RaceTarget,
    RaceSubtypeTarget,
    SelfTarget,
    SpecificItemTarget,
    SpellDescriptorTarget,
    SpellSchoolTarget,
    SpellSubschoolTarget,
    SpellTarget,
    TokenTarget,
    WeaponGroupTarget,
    WeaponTarget,
    WeaponTypeTarget,
    WhenActiveTarget,
    WhenInCombatTarget,
    WhenTargetInRange,
].forEach(Sources.registerSource);
