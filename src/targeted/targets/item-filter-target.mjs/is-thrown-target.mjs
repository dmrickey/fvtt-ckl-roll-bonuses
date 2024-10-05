import { BaseIsItemTarget } from './base-is-item-target.mjs';

export class IsThrownTarget extends BaseIsItemTarget {

    /**
     * @override
     */
    static get sourceKey() { return 'is-thrown'; }

    /**
     * @override
     * @param {object} args
     * @param {Nullable<ItemAction>} [args.action]
     * @returns {boolean}
     */
    static extendedItemFilter({ action = null }) {
        return (action?.data.actionType ?? '') === 'twak';
    }
}
