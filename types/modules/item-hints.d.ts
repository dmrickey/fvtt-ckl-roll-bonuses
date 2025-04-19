export {};
declare global {
    function hintFunc(
        hintcls: typeof Hint,
        actor: ActorPF,
        item: ItemPF,
        data: any
    ): undefined | Hint | Hint[];

    class Hint {
        static create(
            label: string,
            cssClasses: string[],
            options: ItemHintData
        ): Hint {}
    }

    type hintFunc = (
        hintCls: ItemHintsAPI['HintClass'],
        actor: ActorPF,
        item: ItemPF,
        data: ItemHintData
    ) => Hint | Hint[] | undefined;

    interface ItemHintData {
        hint?: string;
        icon?: string;
        image?: string;
        combo?: boolean;
    }

    interface ItemHintsAPI {
        HintClass: typeof Hint;
        addHandler: (
            arg0: (
                actor: ActorPF,
                item: ItemPF,
                data: ItemHintData
            ) => Hint[] | undefined
        ) => void;
    }
}
