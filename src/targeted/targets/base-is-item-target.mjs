import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { BaseTarget } from './base-target.mjs';

/**
 * @abstract
 */
export class BaseIsItemTarget extends BaseTarget {

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
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, item }) {
        showEnabledLabel({
            item,
            key: this.key,
            parent: html,
        });
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF | ActionUse | ItemAction} doc
     * @returns {ItemPF[]}
     */
    static getSourcesFor(doc) {
        const item = doc instanceof pf1.documents.item.ItemPF
            ? doc
            : doc.item;
        if (!item.actor) {
            return [];
        }

        const action = doc instanceof pf1.components.ItemAction ? doc : item.firstAction;
        if (!this._itemFilter({ item, action })) {
            return [];
        }

        const flaggedItems = item.actor.itemFlags.boolean[this.key]?.sources ?? [];
        return flaggedItems;
    };
}
