import { BaseItemFilterTarget } from './base-item-filter-target.mjs';

export class IsMeleeWeaponTarget extends BaseItemFilterTarget {

    /**
     * @override
     */
    static get targetKey() { return 'is-melee'; }

    /**
     * @override
     * @returns {(item: ItemPF) => boolean}
     */
    static get extendedItemFilter() { return (item) => item.actions?.some((action) => action.data.actionType === 'mwak'); }

    static getHints
}

// TODO
