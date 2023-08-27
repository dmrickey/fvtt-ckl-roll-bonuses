export { }

declare global {
    interface IdObject {
        id: string,
    }

    interface ModifierSource {
        /** The value of this modifer */
        value: number | string,

        /** The name of the source of this modifier */
        name: string,

        /** The damage type of this modifier */
        modifier: BonusModifers,

        /** The sort priority for this modifier */
        sort: number,
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

    class TokenActorSelectorOptions extends DocumentSheetOptions<ItemPF> {
        currentTargetUuids: string[];
        availableTargets: {
            checked?: boolean;
            disposition: number;
            dispositionLabel?: string;
            id: string;
            img: string;
            name: string;
            uuid: string;
        }[];
        path: string;
    }

    declare type DamageInputModel = DamagePart & { crit: Nullable<'crit' | 'nonCrit' | 'normal'> };
}
