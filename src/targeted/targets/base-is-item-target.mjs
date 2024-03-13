import { MODULE_NAME } from '../../consts.mjs';
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
    static #itemFilter({ item, action = null }) {
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
        /** @type {string[]} */
        if (source.getFlag(MODULE_NAME, this.key)) {
            return [this.label];
        }
    }

    /**
     * @inheritdoc
     * @override
     * @param {object} options
     * @param {ActorPF | null | undefined} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ html }) {
        showEnabledLabel({
            label: this.label,
            parent: html,
        });
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF | ActionUse | ItemAction} doc
     * @returns {ItemPF[]}
     */
    static getBonusSourcesForTarget(doc) {
        const item = doc instanceof pf1.documents.item.ItemPF
            ? doc
            : doc.item;
        if (!item.uuid || !item.actor) {
            return [];
        }

        const action = doc instanceof pf1.components.ItemAction ? doc : item.firstAction;
        if (!this.#itemFilter({ item, action })) {
            return [];
        }

        const flaggedItems = item.actor.itemFlags.boolean[this.key]?.sources ?? [];
        return flaggedItems;
    };
}
