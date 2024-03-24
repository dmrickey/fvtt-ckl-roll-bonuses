import { BaseIsItemTarget } from './base-is-item-target.mjs';

export class IsMeleeTarget extends BaseIsItemTarget {

    /**
     * @override
     */
    static get targetKey() { return 'is-melee'; }

    /**
     * @override
     * @param {object} args
     * @param {Nullable<ItemAction>} [args.action]
     * @returns {boolean}
     */
    static extendedItemFilter({ action = null }) {
        return ['mwak', 'msak', 'mcman'].includes(action?.data.actionType ?? '');
    }
}
