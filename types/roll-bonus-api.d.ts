import { isEmptyObject } from 'jquery';
import { SpecificBonus } from '../src/bonuses/_specific-bonus.mjs';
import { ArmorFocus } from '../src/bonuses/armor-focus/armor-focus.mjs';
import { ArmorFocusImproved } from '../src/bonuses/armor-focus/improved-armor-focus.mjs';
import { ChangeTypeModification } from '../src/bonuses/change-type-modification.mjs';
import { FatesFavored } from '../src/bonuses/fates-favored.mjs';
import { FlankingImmunity } from '../src/bonuses/flanking/flanking-immunity.mjs';
import { GangUp } from '../src/bonuses/flanking/gang-up.mjs';
import { OutflankImproved } from '../src/bonuses/flanking/outflank-improved.mjs';
import { PackFlanking } from '../src/bonuses/flanking/pack-flanking.mjs';
import { Swarming } from '../src/bonuses/flanking/swarming.mjs';
import { UncannyDodgeImproved } from '../src/bonuses/flanking/uncanny-dodge-improved.mjs';
import { UnderfootAssault } from '../src/bonuses/flanking/underfoot-assault.mjs';
import { FuriousFocus } from '../src/bonuses/furious-focus.mjs';
import { InspirationAmazing } from '../src/bonuses/inspiration/inspiration-amazing.mjs';
import { InspirationBonus } from '../src/bonuses/inspiration/inspiration-bonus.mjs';
import { InspirationExtraDie } from '../src/bonuses/inspiration/inspiration-extra-die.mjs';
import { InspirationFocused } from '../src/bonuses/inspiration/inspiration-focused.mjs';
import { InspirationTenacious } from '../src/bonuses/inspiration/inspiration-tenacious.mjs';
import { InspirationTrue } from '../src/bonuses/inspiration/inspiration-true.mjs';
import { Inspiration } from '../src/bonuses/inspiration/inspiration.mjs';
import { MartialFocus } from '../src/bonuses/martial-focus.mjs';
import { RollSkillUntrained } from '../src/bonuses/roll-untrained.mjs';
import { SkillRankOverride } from '../src/bonuses/skill-rank-override.mjs';
import { SnakeSidewind } from '../src/bonuses/snake-sidewind.mjs';
import { SoloTactics } from '../src/bonuses/solo-tactics.mjs';
import {
    ElementalCl,
    ElementalDc,
} from '../src/bonuses/spells/base-elemental-cl-dc.mjs';
import {
    ElementalFocus,
    ElementalFocusGreater,
    ElementalFocusMythic,
} from '../src/bonuses/spells/elemental-focus.mjs';
import {
    SpellFocus,
    SpellFocusGreater,
    SpellFocusMythic,
} from '../src/bonuses/spells/spell-focus.mjs';
import { SpellSpecialization } from '../src/bonuses/spells/spell-specialization.mjs';
import {
    VersatilePerformance,
    VersatilePerformanceExpanded,
} from '../src/bonuses/versatile-performance.mjs';
import { VersatileTraining } from '../src/bonuses/versatile-training.mjs';
import {
    DevastatingStrike,
    DevastatingStrikeImproved,
} from '../src/bonuses/vital-strike/devastating-strike.mjs';
import {
    VitalStrike,
    VitalStrikeData,
    VitalStrikeGreater,
    VitalStrikeImproved,
    VitalStrikeMythic,
} from '../src/bonuses/vital-strike/vital-strike.mjs';
import {
    WeaponFocus,
    WeaponFocusGreater,
    WeaponFocusMythic,
    WeaponFocusRacial,
} from '../src/bonuses/weapon-focus/weapon-focus.mjs';
import { WeaponSpecializationGreater } from '../src/bonuses/weapon-specialization/greater-weapon-specialization.mjs';
import { WeaponSpecialization } from '../src/bonuses/weapon-specialization/weapon-specialization.mjs';
import { BaseGlobalBonus } from '../src/global-bonuses/base-global-bonus.mjs';
import { FlankingGlobalBonus } from '../src/global-bonuses/flanking-global-bonus.mjs';
import { HigherGroundGlobalBonus } from '../src/global-bonuses/higher-ground-global-bonus.mjs';
import { RangedIncrementPenaltyGlobalBonus } from '../src/global-bonuses/ranged-increment-penalty-global-bonus.mjs';
import { RequireMeleeThreatenGlobalBonus } from '../src/global-bonuses/require-melee-threatens.mjs';
import { ShootIntoMeleeGlobalBonus } from '../src/global-bonuses/shoot-into-melee-global-bonus.mjs';
import { Outflank } from '../src/global-bonuses/specific/bonuses/flanking/outflank.mjs';
import { PreciseShot } from '../src/global-bonuses/specific/bonuses/precise-shot-bonus.mjs';
import { MenacingBonus } from '../src/global-bonuses/targeted/bonuses/menacing.mjs';
import { addNodeToRollBonus } from '../src/handlebars-handlers/add-bonus-to-item-sheet.mjs';
import { checkboxInput } from '../src/handlebars-handlers/bonus-inputs/chekbox-input.mjs';
import { errorMessage } from '../src/handlebars-handlers/bonus-inputs/error-message.mjs';
import { keyValueSelect } from '../src/handlebars-handlers/bonus-inputs/key-value-select.mjs';
import { radioInput } from '../src/handlebars-handlers/bonus-inputs/radio-input.mjs';
import { stringSelect } from '../src/handlebars-handlers/bonus-inputs/string-select.mjs';
import { textInputAndKeyValueSelect } from '../src/handlebars-handlers/bonus-inputs/text-input-and-key-value-select.mjs';
import { textInput } from '../src/handlebars-handlers/bonus-inputs/text-input.mjs';
import {
    BonusPickerApp,
    showBonusPicker,
} from '../src/handlebars-handlers/bonus-picker.mjs';
import { showEnabledLabel } from '../src/handlebars-handlers/enabled-label.mjs';
import { showInvalidLabel } from '../src/handlebars-handlers/invalid-label.mjs';
import { modifiersInput } from '../src/handlebars-handlers/targeted/bonuses/conditional-modifiers-input.mjs';
import { damageInput } from '../src/handlebars-handlers/targeted/bonuses/damage.mjs';
import { showScriptBonusEditor } from '../src/handlebars-handlers/targeted/bonuses/script-call-bonus-input.mjs';
import {
    ActionSelector,
    showActionInput,
} from '../src/handlebars-handlers/targeted/targets/action-input.mjs';
import { showActorInput } from '../src/handlebars-handlers/targeted/targets/actor-input.mjs';
import { ActorSelectorApp } from '../src/handlebars-handlers/targeted/targets/actor-select-app.mjs';
import {
    ItemSelector,
    showItemInput,
} from '../src/handlebars-handlers/targeted/targets/item-input.mjs';
import { showTokenInput } from '../src/handlebars-handlers/targeted/targets/token-input.mjs';
import { TokenSelectorApp } from '../src/handlebars-handlers/targeted/targets/token-select-app.mjs';
import { traitInput } from '../src/handlebars-handlers/trait-input.mjs';
import { BaseMigrate } from '../src/migration/_migrate-base.mjs';
import { handleBonusesFor } from '../src/target-and-bonus-join.mjs';
import { BaseSource } from '../src/targeted/_base-source.mjs';
import { BaseBonus } from '../src/targeted/bonuses/_base-bonus.mjs';
import { AgileBonus } from '../src/targeted/bonuses/agile.mjs';
import { AttackBonus } from '../src/targeted/bonuses/attack-bonus.mjs';
import { BaneBonus } from '../src/targeted/bonuses/bane-bonus.mjs';
import { CasterLevelBonus } from '../src/targeted/bonuses/caster-level-bonus.mjs';
import { ConditionalModifiersBonus } from '../src/targeted/bonuses/conditional-modifiers-bonus.mjs';
import { CritBonus } from '../src/targeted/bonuses/crit-bonus.mjs';
import { DamageBonus } from '../src/targeted/bonuses/damage-bonus.mjs';
import { DCBonus } from '../src/targeted/bonuses/dc-bonus.mjs';
import { DiceTransformBonus } from '../src/targeted/bonuses/dice-transform-bonus.mjs';
import { EffectiveSizeBonus } from '../src/targeted/bonuses/effective-size-bonus.mjs';
import { EnhancementBonus } from '../src/targeted/bonuses/enhancement-bonus.mjs';
import { FinesseBonus } from '../src/targeted/bonuses/finesse-bonus.mjs';
import { FootnoteBonus } from '../src/targeted/bonuses/footnote-bonus.mjs';
import { FortuneBonus } from '../src/targeted/bonuses/fortune-bonus.mjs';
import { MisfortuneBonus } from '../src/targeted/bonuses/misfortune-bonus.mjs';
import { ScriptCallBonus } from '../src/targeted/bonuses/script-call-bonus.mjs';
import { Sources } from '../src/targeted/source-registration.mjs';
import { BaseTargetOverride } from '../src/targeted/target-overides/_base-target-override.mjs';
import { FinesseOverride } from '../src/targeted/target-overides/finesse-override.mjs';
import { ProficiencyOverride } from '../src/targeted/target-overides/proficiency-override.mjs';
import { WeaponGroupOverride } from '../src/targeted/target-overides/weapon-group-override.mjs';
import { WeaponBaseTypeOverride } from '../src/targeted/target-overides/weapon-type-override.mjs';
import { BaseTarget } from '../src/targeted/targets/_base-target.mjs';
import { ActionTarget } from '../src/targeted/targets/action-target.mjs';
import { ActionTypeTarget } from '../src/targeted/targets/action-type-target.mjs';
import { BaseConditionalTarget } from '../src/targeted/targets/conditional/_base-conditional.target.mjs';
import { AlignmentTarget } from '../src/targeted/targets/conditional/alignment-target.mjs';
import { AllTarget } from '../src/targeted/targets/conditional/all-target.mjs';
import { ConditionTarget } from '../src/targeted/targets/conditional/condition-target.mjs';
import { CreatureSubtypeTarget } from '../src/targeted/targets/conditional/creature-subtype-target.mjs';
import { CreatureTypeTarget } from '../src/targeted/targets/conditional/creature-type-target.mjs';
import { FunctionTarget } from '../src/targeted/targets/conditional/function-target.mjs';
import { HasBooleanFlagTarget } from '../src/targeted/targets/conditional/has-boolean-flag-target.mjs';
import { IsFlankingTarget } from '../src/targeted/targets/conditional/is-flanking-target.mjs';
import { WhenTargetInRangeTarget } from '../src/targeted/targets/conditional/is-target-within-range.mjs';
import { TokenTarget } from '../src/targeted/targets/conditional/token-target.mjs';
import { WhenActiveTarget } from '../src/targeted/targets/conditional/when-active-target.mjs';
import { WhenInCombatTarget } from '../src/targeted/targets/conditional/when-in-combat-target.mjs';
import { WhileAdjacentToTarget } from '../src/targeted/targets/conditional/while-adjacent-to-target.mjs';
import { WhileWeaponTypeTarget } from '../src/targeted/targets/conditional/while-equipped-target.mjs';
import { WhileSharingSquareWithTarget } from '../src/targeted/targets/conditional/while-sharing-square-with-target.mjs';
import { DamageTypeTarget } from '../src/targeted/targets/damage-type-target.mjs';
import { FinesseTarget } from '../src/targeted/targets/finesse-target.mjs';
import { SelfTarget } from '../src/targeted/targets/self-target.mjs';
import { SpecificItemTarget } from '../src/targeted/targets/specific-item-target/specific-item-target.mjs';
import { SpellTarget } from '../src/targeted/targets/specific-item-target/spell-target.mjs';
import { WeaponTarget } from '../src/targeted/targets/specific-item-target/weapon-target.mjs';
import { SpellDescriptorTarget } from '../src/targeted/targets/spell-descriptor-target.mjs';
import { SpellSchoolTarget } from '../src/targeted/targets/spell-school-target.mjs';
import { SpellSubschoolTarget } from '../src/targeted/targets/spell-subschool-target.mjs';
import { WeaponGroupTarget } from '../src/targeted/targets/weapon-group-target.mjs';
import { WeaponTypeTarget } from '../src/targeted/targets/weapon-type-target.mjs';
import {
    isMelee,
    isNatural,
    isNaturalSecondary,
    isPhysical,
    isRanged,
    isSpell,
    isThrown,
    isWeapon,
} from '../src/util/action-type-helpers.mjs';
import {
    difference,
    intersection,
    intersects,
} from '../src/util/array-intersects.mjs';
import { addCheckToAttackDialog } from '../src/util/attack-dialog-helper.mjs';
import { confirmationDialog } from '../src/util/confirmation-dialog.mjs';
import { getEnhancementBonusForAction } from '../src/util/enhancement-bonus-helper.mjs';
import { FormulaCacheHelper, getDocFlags } from '../src/util/flag-helpers.mjs';
import {
    currentTargetedActors,
    currentTargets,
} from '../src/util/get-current-targets.mjs';
import { getActionDamageTypes } from '../src/util/get-damage-types.mjs';
import {
    getIdsBySourceFromActor,
    getIdsFromActor,
    getIdsFromItem,
    getTraitsFromItem,
} from '../src/util/get-id-array-from-flag.mjs';
import { getSkillFormula } from '../src/util/get-skill-formula.mjs';
import { getSourceFlag, getSourceFlags } from '../src/util/get-source-flag.mjs';
import { getWeaponGroupsFromActor } from '../src/util/get-weapon-groups-from-actor.mjs';
import { getWeaponTypesFromActor } from '../src/util/get-weapon-types-from-actor.mjs';
import { itemHasCompendiumId } from '../src/util/has-compendium-id.mjs';
import { ifDebug } from '../src/util/if-debug.mjs';
import { isActorInCombat } from '../src/util/is-actor-in-combat.mjs';
import { isNotEmptyObject } from '../src/util/is-empty-object.mjs';
import { registerItemHint } from '../src/util/item-hints.mjs';
import { listFormat } from '../src/util/list-format.mjs';
import { localize } from '../src/util/localize.mjs';
import { onCreate, onRenderCreate } from '../src/util/on-create.mjs';
import { onSkillSheetRender } from '../src/util/on-skill-sheet-render-handler.mjs';
import { PositionalHelper } from '../src/util/positional-helper.mjs';
import { simplifyRollFormula } from '../src/util/simplify-roll-formula.mjs';
import { toArray } from '../src/util/to-array.mjs';
import { signed } from '../src/util/to-signed-string.mjs';
import { Trait } from '../src/util/trait-builder.mjs';
import { truthiness } from '../src/util/truthiness.mjs';
import { distinct, uniqueArray } from '../src/util/unique-array.mjs';

export class _RollBonusesAPI {
    es: any;
    /** Applications that the app uses that are used by various inputs */
    applications: {
        ActionSelector: typeof ActionSelector;
        ActorSelectorApp: typeof ActorSelectorApp;
        BonusPickerApp: typeof BonusPickerApp;
        ItemSelector: typeof ItemSelector;
        TokenSelectorApp: typeof TokenSelectorApp;
    };
    showApplication: {
        showBonusPicker: typeof showBonusPicker;
    };

    /** config for specific inputs that can be modified by a script or mod */
    config: {
        elementalFocus: {
            icons: {
                acid: { icon: string; css: string };
                cold: { icon: string; css: string };
                electric: { icon: string; css: string };
                fire: { icon: string; css: string };
            };
            damageElements: readonly ['acid', 'cold', 'electric', 'fire'];
        };
        knowledgeSkills: SkillId[];
        /** Used for default classes that can overcome Improved Uncanny Dodge. If any actor has Uncanny Dodge from any other source, that is also included by default */
        rogueClasses: ClassTag[];
        versatilePerformance: {
            getPerformanceSkills: (actor: ActorPF) => {
                [key: SkillId]: string;
            };
            expandedChoices: Array<SkillId>;
        };
        versatileTraining: {
            default: Array<SkillId>;
            mapping: Record<WeaponGroup, Array<SkillId>>;
        };
    };

    /** map of every targeted bonus from its key to its type */
    bonusTypeMap: {
        ['bonus_agile']: typeof AgileBonus;
        ['bonus_attack']: typeof AttackBonus;
        ['bonus_bane']: typeof BaneBonus;
        ['bonus_cl']: typeof CasterLevelBonus;
        ['bonus_conditional-modifiers']: typeof ConditionalModifiersBonus;
        ['bonus_crit']: typeof CritBonus;
        ['bonus_damage']: typeof DamageBonus;
        ['bonus_dc']: typeof DCBonus;
        ['bonus_dice-transform']: typeof DiceTransformBonus;
        ['bonus_effective-size']: typeof EffectiveSizeBonus;
        ['bonus_enh']: typeof EnhancementBonus;
        ['bonus_finesse']: typeof FinesseBonus;
        ['bonus_footnote']: typeof FootnoteBonus;
        ['bonus_fortune']: typeof FortuneBonus;
        ['bonus_misfortune']: typeof MisfortuneBonus;
        ['bonus_script-call']: typeof ScriptCallBonus;

        ['bonus_menacing']?: typeof MenacingBonus;
        ['bonus_ranged-increment-penalty']?: typeof RangedIncrementPenaltyGlobalBonus;
    };
    /** Array of all targeted bonuses */
    get allBonusTypes(): (typeof BaseBonus)[];
    get allBonusTypesKeys(): string[];

    /** map of every targeted bonus from its key to its type */
    globalTypeMap: {
        ['global-bonus_flanking']: typeof FlankingGlobalBonus;
        ['global-bonus_higher-ground']: typeof HigherGroundGlobalBonus;
        ['global-bonus_range-increment-penalty']: typeof RangedIncrementPenaltyGlobalBonus;
        ['global-bonus_require-melee-threaten']: typeof RequireMeleeThreatenGlobalBonus;
        ['global-bonus_shoot-into-melee']: typeof ShootIntoMeleeGlobalBonus;
    };
    /** Array of all global bonuses */
    get allGlobalTypes(): (typeof BaseGlobalBonus)[];
    get allGlobalTypesKeys(): string[];

    /** map of every targeted target from its key to its type */
    targetTypeMap: {
        ['target_action']: typeof ActionTarget;
        ['target_action-type']: typeof ActionTypeTarget;
        ['target_alignment']: typeof AlignmentTarget;
        ['target_all']: typeof AllTarget;
        ['target_condition']: typeof ConditionTarget;
        ['target_damage-type']: typeof DamageTypeTarget;
        ['target_finesse']: typeof FinesseTarget;
        ['target_function']: typeof FunctionTarget;
        ['target_has-boolean-flag']: typeof HasBooleanFlagTarget;
        ['target_is-flanking']: typeof IsFlankingTarget;
        ['target_creature-type']: typeof CreatureTypeTarget;
        ['target_creature-subtype']: typeof CreatureSubtypeTarget;
        ['target_self']: typeof SelfTarget;
        ['target_item']: typeof SpecificItemTarget;
        ['target_spell-descriptor']: typeof SpellDescriptorTarget;
        ['target_spell-school']: typeof SpellSchoolTarget;
        ['target_spell-subschool']: typeof SpellSubschoolTarget;
        ['target_spell']: typeof SpellTarget;
        ['target_token']: typeof TokenTarget;
        ['target_weapon-group']: typeof WeaponGroupTarget;
        ['target_weapon']: typeof WeaponTarget;
        ['target_weapon-type']: typeof WeaponTypeTarget;
        ['target_when-active']: typeof WhenActiveTarget;
        ['target_when-in-combat']: typeof WhenInCombatTarget;
        ['target_is-target-within-range']: typeof WhenTargetInRangeTarget;
        ['target_while-adjacent-to']: typeof WhileAdjacentToTarget;
        ['target_while-sharing-with']: typeof WhileSharingSquareWithTarget;
        ['target_while-weapon-type-equipped']: typeof WhileWeaponTypeTarget;
    };
    /** Array of all targeted targets */
    get allTargetTypes(): (typeof BaseTarget)[];
    get allTargetTypesKeys(): string[];

    get allConditionalTargetTypes(): (typeof BaseConditionalTarget)[];

    get allTargetTypesKeys(): (typeof BaseConditionalTarget)[];

    /** map of every target override from its key to its type */
    targetOverrideTypeMap: {
        ['target-override_finesse-override']: typeof FinesseOverride;
        ['target-override_proficiency']: typeof ProficiencyOverride;
        ['target-override_weapon-type-override']: typeof WeaponBaseTypeOverride;
        ['target-override_weapon-group-override']: typeof WeaponGroupOverride;
    };
    /** Array of all targeted targets */
    get allTargetOverrideTypes(): (typeof BaseTargetOverride)[];
    get allTargetOverrideTypesKeys(): string[];

    specificBonusTypeMap: {
        ['armor-focus']: typeof ArmorFocus;
        ['armor-focus-improved']: typeof ArmorFocusImproved;
        ['change-modification']: typeof ChangeTypeModification;
        ['devastating-strike']: typeof DevastatingStrike;
        ['devastating-strike-improved']: typeof DevastatingStrikeImproved;
        ['elemental-cl']: typeof ElementalCl;
        ['elemental-dc']: typeof ElementalDc;
        ['elemental-focus']: typeof ElementalFocus;
        ['elemental-focus-greater']: typeof ElementalFocusGreater;
        ['elemental-focus-mythic']: typeof ElementalFocusMythic;
        ['fates-favored']: typeof FatesFavored;
        ['flanking-immunity']: typeof FlankingImmunity;
        ['furious-focus']: typeof FuriousFocus;
        ['gang-up']: typeof GangUp;
        ['inspiration']: typeof Inspiration;
        ['inspiration-amazing']: typeof InspirationAmazing;
        ['inspiration-bonus']: typeof InspirationBonus;
        ['inspiration-extra-die']: typeof InspirationExtraDie;
        ['inspiration-focused']: typeof InspirationFocused;
        ['inspiration-tenacious']: typeof InspirationTenacious;
        ['inspiration-true']: typeof InspirationTrue;
        ['martial-focus']: typeof MartialFocus;
        ['outflank-improved']: typeof OutflankImproved;
        ['pack-flanking']: typeof PackFlanking;
        ['roll-untrained']: typeof RollSkillUntrained;
        ['skill-rank-override']: typeof SkillRankOverride;
        ['snake-sidewind']: typeof SnakeSidewind;
        ['solo-tactics']: typeof SoloTactics;
        ['spell-focus']: typeof SpellFocus;
        ['spell-focus-greater']: typeof SpellFocusGreater;
        ['spell-focus-mythic']: typeof SpellFocusMythic;
        ['spell-specialization']: typeof SpellSpecialization;
        ['swarming']: typeof Swarming;
        ['uncanny-dodge-improved']: typeof UncannyDodgeImproved;
        ['underfoot-assault']: typeof UnderfootAssault;
        ['versatile-performance']: typeof VersatilePerformance;
        ['versatile-performance-expanded']: typeof VersatilePerformanceExpanded;
        ['versatile-training']: typeof VersatileTraining;
        ['vital-strike']: typeof VitalStrike;
        ['vital-strike-greater']: typeof VitalStrikeGreater;
        ['vital-strike-improved']: typeof VitalStrikeImproved;
        ['vital-strike-mythic']: typeof VitalStrikeMythic;
        ['weapon-focus']: typeof WeaponFocus;
        ['weapon-focus-greater']: typeof WeaponFocusGreater;
        ['weapon-focus-mythic']: typeof WeaponFocusMythic;
        ['weapon-focus-racial']: typeof WeaponFocusRacial;
        ['weapon-specialization']: typeof WeaponSpecialization;
        ['weapon-specialization-greater']: typeof WeaponSpecializationGreater;

        ['outflank']?: typeof Outflank;
        ['precise-shot']?: typeof PreciseShot;
    };
    /** Array of all targeted targets */
    get allSpecificBonusTypes(): (typeof SpecificBonus)[];
    get allSpecificBonusTypesKeys(): string[];

    /** all the input helpers for adding various inputs for bonusees */
    inputs: {
        addNodeToRollBonus: typeof addNodeToRollBonus;
        checkboxInput: typeof checkboxInput;
        damageInput: typeof damageInput;
        errorMessage: typeof errorMessage;
        keyValueSelect: typeof keyValueSelect;
        modifiersInput: typeof modifiersInput;
        radioInput: typeof radioInput;
        showActionInput: typeof showActionInput;
        showActorInput: typeof showActorInput;
        showEnabledLabel: typeof showEnabledLabel;
        showInvalidLabel: typeof showInvalidLabel;
        showItemInput: typeof showItemInput;
        showScriptBonusEditor: typeof showScriptBonusEditor;
        showTokenInput: typeof showTokenInput;
        stringSelect: typeof stringSelect;
        textInput: typeof textInput;
        textInputAndKeyValueSelect: typeof textInputAndKeyValueSelect;
        traitInput: typeof traitInput;
    };

    /** for being able to manually trigger an update in case something was missed */
    migrate: {
        migrate(): Promise;
        v1: {};
        v2: {};
        v3: {};
        v4: {};
        v5: {};
        v6: BaseMigrate;
    };

    /** Base source classes for extending */
    sources: {
        BaseBonus: typeof BaseBonus;
        BaseSource: typeof BaseSource;
        BaseTarget: typeof BaseTarget;
        BaseConditionalTarget: typeof BaseConditionalTarget;
        BaseTargetOverride: typeof BaseTargetOverride;
    };
    BaseGlobalBonus: typeof BaseGlobalBonus;
    SpecificBonus: typeof SpecificBonus;

    /** various utility helper methods and classes used throughout the mod */
    utils: {
        actionTypeHelpers: {
            isMelee: typeof isMelee;
            isNatural: typeof isNatural;
            isNaturalSecondary: typeof isNaturalSecondary;
            isPhysical: typeof isPhysical;
            isRanged: typeof isRanged;
            isSpell: typeof isSpell;
            isThrown: typeof isThrown;
            isWeapon: typeof isWeapon;
        };
        array: {
            difference: typeof difference;
            distinct: typeof distinct;
            intersection: typeof intersection;
            intersects: typeof intersects;
            listFormat: typeof listFormat;
            uniqueArray: typeof uniqueArray;
        };
        getIds: {
            getIdsBySourceFromActor: typeof getIdsBySourceFromActor;
            getIdsFromActor: typeof getIdsFromActor;
            getIdsFromItem: typeof getIdsFromItem;
            getTraitsFromItem: typeof getTraitsFromItem;
        };

        addCheckToAttackDialog: typeof addCheckToAttackDialog;
        confirmationDialog: typeof confirmationDialog;
        currentTargetedActors: typeof currentTargetedActors;
        currentTargets: typeof currentTargets;
        getActionDamageTypes: typeof getActionDamageTypes;
        getDocFlags: typeof getDocFlags;
        getEnhancementBonusForAction: typeof getEnhancementBonusForAction;
        getSkillFormula: typeof getSkillFormula;
        getSourceFlag: typeof getSourceFlag;
        getSourceFlags: typeof getSourceFlags;
        getWeaponGroupsFromActor: typeof getWeaponGroupsFromActor;
        getWeaponTypesFromActor: typeof getWeaponTypesFromActor;
        handleBonusesFor: typeof handleBonusesFor;
        ifDebug: typeof ifDebug;
        isActorInCombat: typeof isActorInCombat;
        isEmptyObject: typeof isEmptyObject;
        isNotEmptyObject: typeof isNotEmptyObject;
        itemHasCompendiumId: typeof itemHasCompendiumId;
        localize: typeof localize;
        onCreate: typeof onCreate;
        onRenderCreate: typeof onRenderCreate;
        onSkillSheetRender: typeof onSkillSheetRender;
        registerItemHint: typeof registerItemHint;
        registerSource: (typeof Sources)['registerSource'];
        signed: typeof signed;
        simplifyRollFormula: typeof simplifyRollFormula;
        toArray: typeof toArray;
        truthiness: typeof truthiness;

        FormulaCacheHelper: typeof FormulaCacheHelper;
        PositionalHelper: typeof PositionalHelper;
        Trait: typeof Trait;
        VitalStrikeData: typeof VitalStrikeData;
    };
}
