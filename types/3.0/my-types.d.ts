export {};

declare global {
    interface Indexed<T> {
        /** the index of this within its container @see {T} */
        index: number;
    }

    declare type TargetBonusValue = Array<
        string | number | object | string[] | number[] | object[]
    >;

    declare type Target = {
        key: string;
        value: TargetBonusValue;
        join: 'and' | 'or';
    };
    declare type IndexedTarget = Target & Indexed<Target>;

    declare type Bonus = {
        key: string;
        value: TargetBonusValue;
    };
    declare type IndexedBonus = Bonus & Indexed<Bonus>;

    class SetTargetBonus {
        bonuses: Bonus[];
        targets: Target[];
    }
    declare type IndexedSetTargetBonus = SetTargetBonus & Indexed;

    interface BaseDocument {
        getFlag(
            moduleName: string,
            key: 'ckl-target-bonus-sets'
        ): SetTargetBonus[];
        getFlag(moduleName: string, key: string): any;

        setFlag(
            moduleName: string,
            key: 'ckl-target-bonus-sets',
            value: SetTargetBonus[]
        );
        setFlag<T>(moduleName: string, key: string, value: T);
    }
}
