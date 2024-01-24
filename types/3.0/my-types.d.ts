export {};

declare global {
    declare type TargetBonusValue = Array<
        string | number | object | string[] | number[] | object[]
    >;

    declare class Target {
        key: string;
        value: TargetBonusValue;
        join: 'and' | 'or';
    }

    declare class Bonus {
        key: string;
        value: TargetBonusValue;
    }

    declare class SetTargetBonus {
        bonuses: Bonus[];
        targets: Target[];
    }

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
