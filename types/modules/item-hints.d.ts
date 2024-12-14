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
            options: {
                hint?: string;
                icon?: string;
                image?: string;
            }
        ): Hint {}
    }

    interface ItemHintsAPI {
        HintClass: typeof Hint;
        addHandler: (
            arg0: (
                actor: ActorPF,
                item: ItemPF,
                data: { icon: string; hint: string }
            ) => Hint[] | undefined
        ) => void;
    }
}
