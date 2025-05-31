import { MODULE_NAME } from "../../../consts.mjs";
import { showItemInput } from "../../../handlebars-handlers/targeted/targets/item-input.mjs";
import { toArray } from '../../../util/to-array.mjs';
import { truthiness } from "../../../util/truthiness.mjs";
import { BaseTarget } from "../_base-target.mjs";

export class SpecificItemTarget extends BaseTarget {

    /**
     * @abstract
     * @returns {string}
     */
    static get _description() { return ''; }

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
    static _getIdsFromItem(item) {
        const ids = (/** @type {string[]} */(item.getFlag(MODULE_NAME, this.key) ?? []))
            .map((id) => id.split('.').at(-1))
            .filter(truthiness);
        return ids;
    }

    /**
     * @param {ActorPF} actor
     * @returns {ItemPF[]}
     */
    static getItemsFromActor(actor) {
        return actor.allItems.filter(x => x.hasAction);
    }

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
            const ids = this._getIdsFromItem(source);
            return ids.includes(item.id) || !!item.links.parent && ids.includes(item.links.parent.id);
        });
        return bonusSources;
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {ArrayOrSelf<string>} ids - Ids, not uuids
     * @returns {Promise<void>}
     */
    static async configure(item, ids) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: toArray(ids),
                },
            },
        });
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
            description: this._description,
            itemsFromActorFunc: this.getItemsFromActor,
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
