import { showEnabledLabel } from '../../../handlebars-handlers/enabled-label.mjs';
import { BaseTarget } from '../base-target.mjs';

/**
 * @abstract
 */
export class BaseIsItemTarget extends BaseTarget {

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.iurMG1TBoX3auh5z#action-type'; }

    /**
     * @param {object} args
     * @param {ItemPF} args.item,
     * @param {Nullable<ItemAction>} [args.action]
     * @returns {boolean}
     */
    static _itemFilter({ item, action = null }) {
        return !!item?.hasAction && this.extendedItemFilter({ item, action })
    }

    /**
     * @abstract
     * @param {object} args
     * @param {ItemPF} args.item,
     * @param {Nullable<ItemAction>} [args.action]
     * @returns {boolean}
     */
    static extendedItemFilter({ item, action = null }) { throw new Error('must be overridden'); }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        return [this.label];
    }

    /**
     * @inheritdoc
     * @override
     * @param {object} options
     * @param {ActorPF | null | undefined} options.actor
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        showEnabledLabel({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'target',
        });
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF & { actor: ActorPF }} item
     * @param {ItemPF[]} sources
     * @param {ItemPF | ActionUse | ItemAction} doc
     * @returns {ItemPF[]}
     */
    static _getSourcesFor(item, sources, doc) {
        const action = doc instanceof pf1.components.ItemAction
            ? doc
            : doc instanceof pf1.actionUse.ActionUse
                ? doc.action
                : item.defaultAction;
        if (!this._itemFilter({ item, action })) {
            return [];
        }

        return sources;
    };
}
