import { MODULE_NAME } from '../../../consts.mjs';
import { showItemInput } from '../../../handlebars-handlers/targeted/targets/item-input.mjs';
import { listFormat } from '../../../util/list-format.mjs';
import { localizeFluentDescription } from '../../../util/localize.mjs';
import { truthiness } from '../../../util/truthiness.mjs';
import { BaseConditionalTarget } from './_base-conditional.target.mjs';

/**
 * When Specific item is equipped / enabled / active
 */
export class WhenActiveTarget extends BaseConditionalTarget {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'when-active'; }

    /**
     * @override
     * @inheritdoc
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#when-active/equipped'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @returns {string}
     */
    static fluentDescription(source) {
        const ids = this._getIdsFromItem(source);
        const items = ids.map((id) => source.actor?.items.get(id)).filter(truthiness);

        /** @type {ItemType[]} */
        const equipmentTypes = ['consumable', 'container', 'equipment', 'implant', 'loot', 'weapon'];
        const equipment = [];
        const others = [];
        items.forEach((item) => {
            if (equipmentTypes.includes(item.type)) {
                equipment.push(item);
            } else {
                others.push(item);
            }
        });

        const names = listFormat(items.map(x => x.name), 'or');
        const key = others.length ? 'when-active-feature' : 'when-active-equipment';
        return localizeFluentDescription(key, { item: names });
    }

    /**
     * @returns {string}
     */
    static get #description() { return 'item-app.description-when-active'; }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        /** @type {string[]} */
        if (!source?.actor) return;

        const ids = this._getIdsFromItem(source);
        return ids.map((id) => source.actor?.items.get(id)?.name).filter(truthiness);
    }

    /**
     * @param {ActorPF} actor
     * @returns {ItemPF[]}
     */
    static #getItemsFromActor(actor) {
        return [
            ...actor.itemTypes.buff,
            ...actor.itemTypes.equipment,
            ...actor.itemTypes.weapon,
            ...actor.itemTypes.feat,
        ];
    }

    /**
     * @param {ItemPF} item
     * @returns {string[]}
     */
    static _getIdsFromItem(item) {
        const ids = (/** @type {string[]} */(item.getFlag(MODULE_NAME, this.key) ?? []))
            .map((id) => id.split('.').at(-1))
            .filter(truthiness);
        return ids;
    }

    /**
     * @param {ItemPF} item
     * @returns {string[]}
     */
    static #getIdsFromItem(item) {
        const ids = (/** @type {string[]} */(item.getFlag(MODULE_NAME, this.key) ?? []))
            .map((id) => id.split('.').at(-1))
            .filter(truthiness);
        return ids;
    }

    /**
     * @inheritdoc
     * @override
     * @param {ActorPF} _actor
     * @param {ItemPF[]} sources
     * @returns {ItemPF[]}
     */
    static _filterToApplicableSources(_actor, sources) {
        const filtered = sources.filter((flagged) => {
            /** @type {string[]} */
            const targetedItemIds = this.#getIdsFromItem(flagged);
            return targetedItemIds.every((id) => {
                const item = flagged.actor?.items.get(id);
                return !!item?.isActive || !!item?.links.parent?.isActive;
            });
        });

        return filtered;
    }

    /**
     * @override
     * @param {object} options
     * @param {ActorPF | null | undefined} options.actor
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        showItemInput({
            description: this.#description,
            itemsFromActorFunc: this.#getItemsFromActor,
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
        });
    }
}
