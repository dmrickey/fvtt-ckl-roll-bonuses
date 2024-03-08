import { BaseIsItemTarget } from './base-is-item-target.mjs';

export class IsRangedWeaponTarget extends BaseIsItemTarget {

    /**
     * @inheritdoc
     * @override
     */
    static get targetKey() { return 'is-ranged-weapon'; }

    /**
     * @inheritdoc
     * @override
     * @param {object} args
     * @param {Nullable<ItemAction>} [args.action]
     * @returns {boolean}
     */
    static extendedItemFilter({ action = null }) {
        return action?.data.actionType === 'rwak';
    }
}
