import { Sources } from '../source-registration.mjs';
import { ActionTarget } from "./action-target.mjs";
import { ActionTypeTarget } from './action-type-target.mjs';
import { AlignmentTarget } from './conditional/alignment-target.mjs';
import { AllTarget } from './conditional/all-target.mjs';
import { ConditionTarget } from './conditional/condition-target.mjs';
import { CreatureSubtypeTarget } from './conditional/creature-subtype-target.mjs';
import { CreatureTypeTarget } from './conditional/creature-type-target.mjs';
import { HasBooleanFlagTarget } from './conditional/has-boolean-flag-target.mjs';
import { IsFlankingTarget } from './conditional/is-flanking-target.mjs';
import { WhenTargetInRangeTarget } from './conditional/is-target-within-range.mjs';
import { TokenTarget } from "./conditional/token-target.mjs";
import { WhenActiveTarget } from './conditional/when-active-target.mjs';
import { WhenInCombatTarget } from './conditional/when-in-combat-target.mjs';
import { WhileAdjacentToTarget } from './conditional/while-adjacent-to-target.mjs';
import { WhileSharingSquareWithTarget } from './conditional/while-sharing-square-with-target.mjs';
import { DamageTypeTarget } from "./damage-type-target.mjs";
import { FinesseTarget } from './finesse-target.mjs';
import { FunctionTarget } from './conditional/function-target.mjs';
import { SelfTarget } from './self-target.mjs';
import { SpecificItemTarget } from "./specific-item-target/specific-item-target.mjs";
import { SpellTarget } from "./specific-item-target/spell-target.mjs";
import { WeaponTarget } from "./specific-item-target/weapon-target.mjs";
import { SpellDescriptorTarget } from './spell-descriptor-target.mjs';
import { SpellSchoolTarget } from './spell-school-target.mjs';
import { SpellSubschoolTarget } from './spell-subschool-target.mjs';
import { WeaponGroupTarget } from "./weapon-group-target.mjs";
import { WeaponTypeTarget } from "./weapon-type-target.mjs";

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
    IsFlankingTarget,
    CreatureTypeTarget,
    CreatureSubtypeTarget,
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
    WhenTargetInRangeTarget,
    WhileAdjacentToTarget,
    WhileSharingSquareWithTarget,
].forEach(Sources.registerSource);
