export {};

declare global {
    declare type TargetBonusValue = Array<
        string | number | object | string[] | number[] | object[]
    >;

    declare class Prepared {
        label: string;
        template: string;
        [key: string]: any;
    }

    declare class Target {
        key: string;
        value: TargetBonusValue;
        join: 'and' | 'or';
    }

    declare type PreparedTarget = Prepared & Target;

    declare class Bonus {
        key: string;
        value: TargetBonusValue;
    }

    declare type PreparedBonus = Prepared & Bonus;

    declare class PreparedSetTargetBonus {
        bonuses: PreparedBonus[];
        targets: PreparedTarget[];
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

    interface PrepareBonusData {
        prepareBonusData(actor: ActorPF | null, item: ItemPF): PreparedBonus;
    }
    interface PrepareTargetData {
        prepareTargetData(actor: ActorPF | null, item: ItemPF): PreparedTarget;
    }
}
