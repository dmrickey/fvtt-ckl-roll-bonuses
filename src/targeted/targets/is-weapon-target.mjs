import { BaseIsItemTarget } from './base-is-item-target.mjs';

export class IsWeaponTarget extends BaseIsItemTarget {

    /**
     * @override
     */
    static get targetKey() { return 'is-weapon'; }

    /**
     * @override
     * @param {object} args
     * @param {Nullable<ItemAction>} [args.action]
     * @returns {boolean}
     */
    static extendedItemFilter({ action = null }) {
        return ['mwak', 'rwak'].includes(action?.data.actionType ?? '');
    }
}
