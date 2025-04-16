import { MODULE_NAME } from '../../../consts.mjs';
import { truthiness } from '../../../util/truthiness.mjs';
import { SpecificItemTarget } from "../specific-item-target/specific-item-target.mjs";

/**
 * When Specific item is equipped / enabled / active
 */
export class WhenActiveTarget extends SpecificItemTarget {

    /**
     * @override
     * @returns {string}
     */
    static get _description() { return 'item-app.description-when-active'; }

    /**
     * @override
     * @param {ActorPF} actor
     * @returns {ItemPF[]}
     */
    static getItemsFromActor(actor) {
        return [
            ...actor.itemTypes.buff,
            ...actor.itemTypes.equipment,
            ...actor.itemTypes.weapon,
            ...actor.itemTypes.feat,
        ];
    }

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'when-active'; }

    /**
     * @override
     * @inheritdoc
     */
    static get isConditionalTarget() { return true; }

    /**
     * @override
     * @inheritdoc
     */
    static get isGenericTarget() { return true; }

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
     * @param {ItemPF & { actor: ActorPF }} _item
     * @param {ItemPF[]} sources
     * @returns {ItemPF[]}
     */
    static _getSourcesFor(_item, sources) {
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
     * @inheritdoc
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#when-active'; }
}
