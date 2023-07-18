export { }
declare global {
    function hintFunc(hintcls: typeof Hint, actor: ActorPF, item: ItemPF, data: any): undefined | Hint | Hint[];

    class Hint {
        static create(label: string, dunno: any[], dunno2: object): Hint { }
    }

    interface ItemHintsAPI {
        HintClass: typeof HintClass;
        addHandler: (arg0: (actor: ActorPF, item: ItemPF, data: Object) => Hint[] | undefined) => void;
    }
}
