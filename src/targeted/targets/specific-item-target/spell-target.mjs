import { SpecificItemTarget } from "./specific-item-target.mjs";

export class SpellTarget extends SpecificItemTarget {

    /**
     * @override
     * @param {ActorPF} actor
     * @returns {ItemPF[]}
     */
    static getItemsFromActor(actor) {
        return actor.itemTypes.spell.filter(x => x.hasAction);
    }

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
