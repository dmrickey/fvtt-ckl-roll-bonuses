import { BaseIsItemTarget } from './base-is-item-target.mjs';

export class IsRangedTarget extends BaseIsItemTarget {

    /**
     * @inheritdoc
     * @override
     */
    static get sourceKey() { return 'is-ranged'; }

    /**
     * @inheritdoc
     * @override
     * @param {object} args
     * @param {Nullable<ItemAction>} [args.action]
     * @returns {boolean}
     */
    static extendedItemFilter({ action = null }) {
        return ['rcman', 'rwak', 'rsak', 'twak'].includes(action?.data.actionType ?? '');
    }
}
