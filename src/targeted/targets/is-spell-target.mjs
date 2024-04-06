import { BaseIsItemTarget } from './base-is-item-target.mjs';

export class IsSpellTarget extends BaseIsItemTarget {

    /**
     * @override
     */
    static get sourceKey() { return 'is-spell'; }

    /**
     * @override
     * @param {object} args
     * @param {Nullable<ItemAction>} [args.action]
     * @returns {boolean}
     */
    static extendedItemFilter({ action = null }) {
        return ['msak', 'rsak', 'spellsave'].includes(action?.data.actionType ?? '');
    }
}
