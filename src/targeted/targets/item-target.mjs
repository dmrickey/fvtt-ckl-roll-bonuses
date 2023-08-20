import { MODULE_NAME } from "../../consts.mjs";
import { showItemInput } from "../../handlebars-handlers/targeted/targets/item-input.mjs";
import { BaseTarget } from "./base-target.mjs";

export class ItemTarget extends BaseTarget {

    /**
     * @inheritdoc
     * @override
     */
    static get type() { return 'item'; }

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
            return targetedItemUuids.includes(item.uuid);
        });

        return bonusSources;
    }

    // todo show warning if any chosen items don't exist or belong to another actor

    /**
     * @override
     * @param {object} options
     * @param {ActorPF | null | undefined} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ actor, item, html }) {
        showItemInput({
            item,
            filter: (/** @type {ItemPF} */ item) => item.hasAction,
            key: this.key,
            parent: html,
        });
    }
}
