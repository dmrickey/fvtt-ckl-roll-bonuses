import { BaseSource } from '../src/targeted/_base-source.mjs';
import { BaseBonus } from '../src/targeted/bonuses/_base-bonus.mjs';
import { BaseTarget } from '../src/targeted/targets/_base-target.mjs';
import {
    SpecificBonus,
    SpecificBonuses,
} from '../src/bonuses/_specific-bonus.mjs';
import { BaseGlobalBonus } from '../src/global-bonuses/base-global-bonus.mjs';
import { handleBonusesFor } from '../src/target-and-bonus-join.mjs';
import { showBonusPicker } from '../src/handlebars-handlers/bonus-picker.mjs';
import { BaseTargetOverride } from '../src/targeted/target-overides/_base-target-override.mjs';
import { simplifyRollFormula } from '../src/util/simplify-roll-formula.mjs';
import { VitalStrikeData } from '../src/bonuses/vital-strike/vital-strike.mjs';
import { BaseMigrate } from '../src/migration/_migrate-base.mjs';
import { BaneBonus } from '../src/targeted/bonuses/bane-bonus.mjs';
import { Sources } from '../src/targeted/source-registration.mjs';
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
import { getEnhancementBonusForAction } from '../src/util/enhancement-bonus-helper.mjs';
import { FormulaCacheHelper, getDocFlags } from '../src/util/flag-helpers.mjs';
import {
    currentTargetedActors,
    currentTargets,
} from '../src/util/get-current-targets.mjs';
import { getActionDamageTypes } from '../src/util/get-damage-types.mjs';
import { getSkillFormula } from '../src/util/get-skill-formula.mjs';
import { itemHasCompendiumId } from '../src/util/has-compendium-id.mjs';
import { ifDebug } from '../src/util/if-debug.mjs';
import { listFormat } from '../src/util/list-format.mjs';
import { PositionalHelper } from '../src/util/positional-helper.mjs';
import { distinct, uniqueArray } from '../src/util/unique-array.mjs';
import { Trait } from '../src/util/trait-builder.mjs';
import {
    getIdsBySourceFromActor,
    getIdsFromActor,
    getIdsFromItem,
    getTraitsFromItem,
} from '../src/util/get-id-array-from-flag.mjs';
import { isActorInCombat } from '../src/util/is-actor-in-combat.mjs';
import { isEmptyObject } from 'jquery';
import { isNotEmptyObject } from '../src/util/is-empty-object.mjs';
import { onCreate, onRenderCreate } from '../src/util/on-create.mjs';
import { onSkillSheetRender } from '../src/util/on-skill-sheet-render-handler.mjs';
import { signed } from '../src/util/to-signed-string.mjs';
import { truthiness } from '../src/util/truthiness.mjs';
import { confirmationDialog } from '../src/util/confirmation-dialog.mjs';
import { addCheckToAttackDialog } from '../src/util/attack-dialog-helper.mjs';
import { registerItemHint } from '../src/util/item-hints.mjs';

export {};

declare global {
    interface RollBonusesAPI {
        /** Applications that the app uses that are used by various inputs */
        applications: Record<string, DocumentSheet>;
        showApplication: {
            showBonusPicker: typeof showBonusPicker;
        };

        /** config for specific inputs that can be modified by a script or mod */
        config: {
            knowledgeSkills: SkillId[];
            elementalFocus: {
                icons: {
                    acid: { icon: string; css: string };
                    cold: { icon: string; css: string };
                    electric: { icon: string; css: string };
                    fire: { icon: string; css: string };
                };
                damageElements: readonly ['acid', 'cold', 'electric', 'fire'];
            };
            versatilePerformance: {
                getPerformanceSkills: (actor: ActorPF) => {
                    [key: SkillId]: string;
                };
                expandedChoices: Array<SkillId>;
            };
            versatileTraining: {
                default: Array<SkillId>;
                mapping: Record<
                    keyof typeof pf1.config.weaponGroups,
                    Array<SkillId>
                >;
            };
        };

        bonusTypeMap: {
            bonus_bane: typeof BaneBonus;
        } & Record<string, typeof BaseBonus>;
        /** Array of all targeted bonuses */
        get allBonusTypes(): (typeof BaseBonus)[];
        get allBonusTypesKeys(): string[];
        /** map of every targeted bonus from its key to its type */

        globalTypeMap: Record<string, typeof BaseGlobalBonus>;
        /** Array of all global bonuses */
        get allGlobalTypes(): (typeof BaseGlobalBonus)[];
        get allGlobalTypesKeys(): string[];
        /** map of every targeted bonus from its key to its type */

        targetTypeMap: Record<string, typeof BaseTarget>;
        /** Array of all targeted targets */
        get allTargetTypes(): (typeof BaseTarget)[];
        get allTargetTypesKeys(): string[];
        /** map of every targeted target from its key to its type */

        targetOverrideTypeMap: Record<string, typeof BaseTargetOverride>;
        /** Array of all targeted targets */
        get allTargetOverrideTypes(): (typeof BaseTargetOverride)[];
        get allTargetOverrideTypesKeys(): string[];
        /** map of every target override from its key to its type */

        specificBonusTypeMap: Record<string, typeof SpecificBonus>;
        /** Array of all targeted targets */
        get allSpecificBonusTypes(): (typeof SpecificBonus)[];
        get allSpecificBonusTypesKeys(): string[];

        /** all the input helpers for adding various inputs for bonusees */
        inputs: Record<string, (...args) => void>;

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
                getTraitsFromItem: typeof getTraitsFromItem;
                getIdsFromItem: typeof getIdsFromItem;
                getIdsFromActor: typeof getIdsFromActor;
                getIdsBySourceFromActor: typeof getIdsBySourceFromActor;
            };

            addCheckToAttackDialog: typeof addCheckToAttackDialog;
            confirmationDialog: typeof confirmationDialog;
            currentTargetedActors: typeof currentTargetedActors;
            currentTargets: typeof currentTargets;
            getActionDamageTypes: typeof getActionDamageTypes;
            getDocFlags: typeof getDocFlags;
            getEnhancementBonusForAction: typeof getEnhancementBonusForAction;
            getSkillFormula: typeof getSkillFormula;
            handleBonusesFor: typeof handleBonusesFor;
            ifDebug: typeof ifDebug;
            isActorInCombat: typeof isActorInCombat;
            isEmptyObject: typeof isEmptyObject;
            isNotEmptyObject: typeof isNotEmptyObject;
            itemHasCompendiumId: typeof itemHasCompendiumId;
            onCreate: typeof onCreate;
            onRenderCreate: typeof onRenderCreate;
            onSkillSheetRender: typeof onSkillSheetRender;
            registerItemHint: typeof registerItemHint;
            registerSource: (typeof Sources)['registerSource'];
            signed: typeof signed;
            simplifyRollFormula: typeof simplifyRollFormula;
            truthiness: typeof truthiness;

            FormulaCacheHelper: typeof FormulaCacheHelper;
            PositionalHelper: typeof PositionalHelper;
            Trait: typeof Trait;
            VitalStrikeData: typeof VitalStrikeData;
        };
    }

    type UUID = string;

    type InputType =
        | 'bonus'
        | 'target'
        | 'target-override'
        | 'specific-bonus'
        | 'ammo';

    interface IdObject {
        id: string;
    }

    interface ModifierSource {
        /** The value of this modifer */
        value: number | string;

        /** The name of the source of this modifier */
        name: string;

        /** The damage type of this modifier */
        modifier: Nullable<BonusTypes | DamageTypes | string>;

        /** The sort priority for this modifier */
        sort: number;
    }

    type Nullable<T> = T | null | undefined;

    declare type DamageInputModel = {
        crit: Nullable<'crit' | 'nonCrit' | 'normal'>;
        formula: string;
        types: Array<string>;
    };

    declare type RecursivePartial<T> = {
        [P in keyof T]?: RecursivePartial<T[P]>;
    };

    declare type ActionTypeFilterFunc = {
        (
            item: ItemPF,
            action?: ItemAction,
            actionUse?: ActionUse | null
        ): boolean;
    };
}
