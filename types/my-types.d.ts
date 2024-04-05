import { BaseSource } from '../src/targeted/base-source.mjs';
import { BaseBonus } from '../src/targeted/bonuses/base-bonus.mjs';
import { BaseTarget } from '../src/targeted/targets/base-target.mjs';
import { SpecificBonuses } from '../src/bonuses/all-specific-bonuses.mjs';

export {};

declare global {
    interface RollBonusesAPI {
        allBonusTypes: (typeof BaseBonus)[];
        allTargetTypes: (typeof BaseTarget)[];
        bonusTypeMap: Record<string, typeof BaseBonus>;
        migrate(): Promise;
        sources: {
            BaseBonus: typeof BaseBonus;
            BaseSource: typeof BaseSource;
            BaseTarget: typeof BaseTarget;
        };
        targetTypeMap: Record<string, typeof BaseTarget>;
        SpecificBonuses: typeof SpecificBonuses;
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
