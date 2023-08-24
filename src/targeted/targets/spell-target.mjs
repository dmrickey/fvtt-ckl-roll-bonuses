import { ItemTarget } from "./item-target.mjs";

export class SpellTarget extends ItemTarget {
    /**
     * @override
     * @returns {(item: ItemPF) => boolean}
     */
    static get itemFilter() { return (/** @type {ItemPF} */ item) => item.hasAction && item.type === 'spell'; }

    /**
     * @override
     */
    static get type() { return 'spell'; }
}
