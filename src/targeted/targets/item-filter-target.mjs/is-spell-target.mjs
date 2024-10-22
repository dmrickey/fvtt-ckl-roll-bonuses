import { BaseIsItemTarget } from './base-is-item-target.mjs';

export class IsSpellTarget extends BaseIsItemTarget {

    /**
     * @override
     */
    static get sourceKey() { return 'is-spell'; }

    /**
     * @override
     * @param {object} args
     * @param {ItemPF} [args.item]
     * @param {Nullable<ItemAction>} [args.action]
     * @returns {boolean}
     */
    static extendedItemFilter({ item, action = null }) {
        const isSpell = item instanceof pf1.documents.item.ItemSpellPF;
        return isSpell || ['msak', 'rsak', 'spellsave'].includes(action?.data.actionType ?? '');
    }
}
