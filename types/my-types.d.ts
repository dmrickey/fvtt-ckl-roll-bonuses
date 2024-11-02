import { BaseSource } from '../src/targeted/base-source.mjs';
import { BaseBonus } from '../src/targeted/bonuses/base-bonus.mjs';
import { BaseTarget } from '../src/targeted/targets/base-target.mjs';
import { SpecificBonuses } from '../src/bonuses/all-specific-bonuses.mjs';
import { BaseGlobalBonus } from '../src/global-bonuses/base-global-bonus.mjs';
import {
    handleBonusesFor,
    handleBonusTypeFor,
} from '../src/target-and-bonus-join.mjs';
import { showBonusPicker } from '../src/handlebars-handlers/bonus-picker.mjs';
import { BaseTargetOverride } from '../src/targeted/target-overides/_base-target-override.mjs';

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
                    [key: keyof typeof pf1.config.skills]: string;
                };
                expandedChoices: Array<keyof typeof pf1.config.skills>;
            };
            versatileTraining: {
                default: Array<keyof typeof pf1.config.skills>;
                mapping: Record<
                    keyof typeof pf1.config.weaponGroups,
                    Array<keyof typeof pf1.config.skills>
                >;
            };
        };

        /** Array of all targeted bonuses */
        get allBonusTypes(): (typeof BaseBonus)[];
        get allBonusTypesKeys(): string[];

        /** Array of all global bonuses */
        get allGlobalTypes(): (typeof BaseGlobalBonus)[];
        get allGlobalTypesKeys(): string[];

        /** Array of all targeted targets */
        get allTargetTypes(): (typeof BaseTarget)[];
        get allTargetTypesKeys(): string[];

        /** Array of all targeted targets */
        get allTargetOverrideTypes(): (typeof BaseTargetOverride)[];
        get allTargetOverrideTypesKeys(): string[];

        /** map of every targeted bonus from its key to its type */
        bonusTypeMap: Record<string, typeof BaseBonus>;

        /** map of every targeted bonus from its key to its type */
        globalTypeMap: Record<string, typeof BaseGlobalBonus>;

        /** map of every targeted target from its key to its type */
        targetTypeMap: Record<string, typeof BaseTarget>;

        /** map of every target override from its key to its type */
        targetOverrideTypeMap: Record<string, typeof BaseTargetOverride>;

        /** all the input helpers for adding various inputs for bonusees */
        inputs: Record<string, (...args) => void>;

        /** for being able to manually trigger an update in case something was missed */
        migrate: {
            migrate(): Promise;
            v1: {};
            v2: {};
            v3: {};
        };

        /** Base source classes for extending */
        sources: {
            BaseBonus: typeof BaseBonus;
            BaseSource: typeof BaseSource;
            BaseTarget: typeof BaseTarget;
            BaseTargetOverride: typeof BaseTargetOverride;
        };
        BaseGlobalBonus: typeof BaseGlobalBonus;

        /** Helper class for registering non-targeted bonuses. Used mostly for the bonus picker application */
        SpecificBonuses: typeof SpecificBonuses;

        /** various utility helper methods and classes used throughout the mod */
        utils: {
            handleBonusesFor: typeof handleBonusesFor;
            handleBonusTypeFor: typeof handleBonusTypeFor;
            array: Record<string, (...args) => any>;
            [key: string]: any;
        };
    }

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

    declare type DamageInputModel = DamagePart & {
        crit: Nullable<'crit' | 'nonCrit' | 'normal'>;
    };

    declare type RecursivePartial<T> = {
        [P in keyof T]?: RecursivePartial<T[P]>;
    };
}
