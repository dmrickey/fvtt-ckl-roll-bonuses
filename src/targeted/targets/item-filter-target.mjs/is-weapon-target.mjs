import { BaseIsItemTarget } from './base-is-item-target.mjs';

export class IsWeaponTarget extends BaseIsItemTarget {

    /**
     * @override
     */
    static get sourceKey() { return 'is-natural'; }

    /**
     * @override
     * @param {object} args
     * @param {Nullable<ItemAction>} [args.action]
     * @returns {boolean}
     */
    static extendedItemFilter({ action = null }) {
        return action?.data.actionType
            ? ['mwak', 'rwak', 'twak'].includes(action.data.actionType)
            : false;
    }
}
