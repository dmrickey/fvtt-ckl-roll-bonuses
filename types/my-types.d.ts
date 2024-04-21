import { BaseSource } from '../src/targeted/base-source.mjs';
import { BaseBonus } from '../src/targeted/bonuses/base-bonus.mjs';
import { BaseTarget } from '../src/targeted/targets/base-target.mjs';
import { SpecificBonuses } from '../src/bonuses/all-specific-bonuses.mjs';

export {};

declare global {
    interface RollBonusesAPI {
        /** Applications that the app uses that are used by various inputs */
        applications: Record<string, DocumentSheet>;

        /** config for specific inputs that can be modified by a script or mod */
        config: {
            versatileTraining: {
                default: Array<keyof typeof pf1.config.skills>;
                mapping: Record<
                    keyof typeof pf1.config.weaponGroups,
                    Array<keyof typeof pf1.config.skills>
                >;
            };
        };

        /** Array of all targeted bonuses */
        allBonusTypes: (typeof BaseBonus)[];

        /** Array of all targeted targets */
        allTargetTypes: (typeof BaseTarget)[];

        /** map of every targeted bonus from its key to its type */
        bonusTypeMap: Record<string, typeof BaseBonus>;

        /** all the input helpers for adding various inputs for bonusees */
        inputs: Record<string, (...args) => void>;

        /** for being able to manually trigger an update in case something was missed */
        migrate: {
            migrate(): Promise;
            v1: {};
        };

        /** mod is fully ready and the api can be used safely */
        ready: boolean;

        /** Base source classes for extending */
        sources: {
            BaseBonus: typeof BaseBonus;
            BaseSource: typeof BaseSource;
            BaseTarget: typeof BaseTarget;
        };

        /** Helper class for registering non-targeted bonuses. Used mostly for the bonus picker application */
        SpecificBonuses: typeof SpecificBonuses;

        /** map of every targeted target from its key to its type */
        targetTypeMap: Record<string, typeof BaseTarget>;

        /** various utility helper methods and classes used throughout the mod */
        utils:
            | { array: Record<string, (...args) => any> }
            | Record<string, (...args) => any>
            | any;
    }

    interface IdObject {
        id: string;
    }

    interface ModifierSource {
        /** The value of this modifer */
        value: number | string;

        /** The name of the source of this modifier */
        name: string;

        /** The damage type of this modifier */
        modifier: Nullable<BonusModifers | string>;

        /** The sort priority for this modifier */
        sort: number;
    }

    type Nullable<T> = T | null | undefined;

    class ItemSelectorOptions extends DocumentSheetOptions<ItemPF> {
        currentUuids: string[];
        items: {
            checked?: boolean;
            uuid: string;
            type: string;
            name: string;
            typeLabel: string;
            img: string;
            id: string;
        }[];
        path: string;
    }

    interface TokenActorSelectorOptions extends DocumentSheetOptions<ItemPF> {
        key: string;
    }

    declare type DamageInputModel = DamagePart & {
        crit: Nullable<'crit' | 'nonCrit' | 'normal'>;
    };
}
