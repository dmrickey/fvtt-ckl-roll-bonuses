import { ItemTarget } from "./item-target.mjs";

export class WeaponTarget extends ItemTarget {
    /**
     * @override
     * @returns {(item: ItemPF) => boolean}
     */
    static get itemFilter() { return (/** @type {ItemPF} */ item) => item.hasAction && ['weapon', 'attack'].includes(item.type); }

    /**
     * @override
     */
    static get type() { return 'weapon'; }
}
