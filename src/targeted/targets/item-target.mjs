import { MODULE_NAME } from "../../consts.mjs";
import { showItemInput } from "../../handlebars-handlers/targeted/targets/item-input.mjs";
import { truthiness } from "../../util/truthiness.mjs";
import { BaseTarget } from "./base-target.mjs";

export class ItemTarget extends BaseTarget {

    /**
     * @returns {(item: ItemPF) => boolean}
     */
    static get itemFilter() { return (/** @type {ItemPF} */ item) => item.hasAction; }

    /**
     * @override
     */
    static get type() { return 'item'; }

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

        // fromUuidSync
        const flaggedItems = item.actor.itemFlags.boolean[this.key]?.sources ?? [];
        const bonusSources = flaggedItems.filter((flagged) => {
            /** @type {string[]} */
            const targetedItemUuids = flagged.getFlag(MODULE_NAME, this.key) || [];
            // todo in v10 stop here when I can lookup the parent link instead of having to look up the parent and see if this is a child
            // return targetedItemUuids.includes(item.uuid);
            if (targetedItemUuids.includes(item.uuid)) {
                return true;
            }

            /** @type {ItemPF[]} */
            const targetedItems = targetedItemUuids.map((uuid) => fromUuidSync(uuid));
            return !!targetedItems.find((ti) => ti.system.links.children.find(({ id }) => id === item.id));
        });

        return bonusSources;
    }

    /**
     * @override
     * @param {object} options
     * @param {ActorPF | null | undefined} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ item, html }) {
        showItemInput({
            item,
            filter: this.itemFilter,
            key: this.key,
            parent: html,
            label: this.label,
        });
    }
}
