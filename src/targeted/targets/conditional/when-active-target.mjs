import { MODULE_NAME } from '../../../consts.mjs';
import { ItemTarget } from "../specific-item-target/item-target.mjs";

export class WhenActiveTarget extends ItemTarget {

    /** @type {ItemType[]} */
    static itemTypes = ['buff', 'equipment', 'weapon', 'feat'];

    /**
     * @override
     * @inheritdoc
     * @returns {(item: ItemPF) => boolean}
     */
    static get itemFilter() { return (/** @type {ItemPF} */ item) => this.itemTypes.includes(item.type); }

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
     * @override
       * @param {ItemPF & { actor: ActorPF }} _item
       * @param {ItemPF[]} sources
     * @returns {ItemPF[]}
     */
    static _getSourcesFor(_item, sources) {
        const filtered = sources.filter((flagged) => {
            /** @type {string[]} */
            const targetedItemUuids = flagged.getFlag(MODULE_NAME, this.key) || [];
            return targetedItemUuids.every((uuid) => {
                const found = /** @type {ItemPF} */ ( /** @type {unknown} */ fromUuidSync(uuid));
                return found.isActive;
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
