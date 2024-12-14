import { SpecificItemTarget } from "./specific-item-target.mjs";

export class WeaponTarget extends SpecificItemTarget {
    /**
     * @override
     * @param {ActorPF} actor
     * @returns {ItemPF[]}
     */
    static getItemsFromActor(actor) {
        return [
            ...actor.itemTypes.container.flatMap((c) => [...c.items]).filter(x => ['weapon', 'attack'].includes(x.type)),
            ...actor.itemTypes.weapon,
            ...actor.itemTypes.attack,
        ].filter(x => x.hasAction);
    }

    /**
     * @override
     */
    static get sourceKey() { return 'weapon'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.iurMG1TBoX3auh5z#weapon'; }
}
