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
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.iurMG1TBoX3auh5z#item'; }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        /** @type {string[]} */
        const flaggedItems = source.getFlag(MODULE_NAME, this.key) ?? [];
        return flaggedItems.map((flagged) => fromUuidSync(flagged)?.name).filter(truthiness);
    }

    /**
     * @override
     * @param {ItemPF & {actor: ActorPF}} item
     * @param {ItemPF[]} sources
     * @returns {ItemPF[]}
     */
    static _getSourcesFor(item, sources) {
        if (!item.uuid) {
            return [];
        }

        const bonusSources = sources.filter((flagged) => {
            /** @type {string[]} */
            const targetedItemUuids = flagged.getFlag(MODULE_NAME, this.key) || [];
            // todo in v10 stop here when I can lookup the parent link instead of having to look up the parent and see if this is a child
            // return targetedItemUuids.includes(item.uuid);
            if (targetedItemUuids.includes(item.uuid)) {
                return true;
            }

            /** @type {ItemPF[]} */
            const targetedItems = targetedItemUuids
                .map((uuid) => fromUuidSync(uuid))
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
