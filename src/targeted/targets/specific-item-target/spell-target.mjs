import { ItemTarget } from "./item-target.mjs";

export class SpellTarget extends ItemTarget {
    /**
     * @override
     * @returns {(item: ItemPF) => boolean}
     */
    static get itemFilter() { return (/** @type {ItemPF} */ item) => item.hasAction && item.type === 'spell'; }

    /**
     * @override
     */
    static get sourceKey() { return 'spell'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.iurMG1TBoX3auh5z#spell'; }
}
