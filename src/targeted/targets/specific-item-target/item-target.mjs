import { MODULE_NAME } from "../../../consts.mjs";
import { showItemInput } from "../../../handlebars-handlers/targeted/targets/item-input.mjs";
import { truthiness } from "../../../util/truthiness.mjs";
import { BaseTarget } from "../base-target.mjs";

export class ItemTarget extends BaseTarget {

    /**
     * @returns {(item: ItemPF) => boolean}
     */
    static get itemFilter() { return (/** @type {ItemPF} */ item) => item.hasAction; }

    /**
     * @override
     */
    static get sourceKey() { return 'item'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.iurMG1TBoX3auh5z#specific-item'; }

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
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        /** @type {string[]} */
        if (!source?.actor) return;

        const ids = ItemTarget.#getIdsFromItem(source);
        return ids.map((id) => source.actor?.items.get(id)?.name).filter(truthiness);
    }

    /**
     * @override
     * @param {ItemPF & {actor: ActorPF}} item
     * @param {ItemPF[]} sources
     * @returns {ItemPF[]}
     */
    static _getSourcesFor(item, sources) {
        if (!item?.id || !item.actor?.items?.size) {
            return [];
        }
        const bonusSources = sources.filter((source) => {
            const ids = ItemTarget.#getIdsFromItem(source);
            // todo in v10 stop here when I can lookup the parent link instead of having to look up the parent and see if this is a child
            if (ids.includes(item.id)) {
                return true;
            }

            /** @type {ItemPF[]} */
            const targetedItems = ids
                .map((id) => item.actor.items.get(id))
                .filter(truthiness);
            return !!targetedItems.find((ti) => ti.system.links.children.find(({ id }) => id === item.id));
        });

        return bonusSources;
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
            filter: this.itemFilter,
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
