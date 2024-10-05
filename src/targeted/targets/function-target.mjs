import { MODULE_NAME } from '../../consts.mjs';
import { textInput } from '../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { BaseTarget } from './base-target.mjs';

/**
 *
   (doc) => {
       const item = doc.item ?? doc;
       if (item instanceof pf1.documents.item.ItemSpellPF) {
           return !!(item.system?.types || '').includes('fear');
       }
   }
 */
export class FunctionTarget extends BaseTarget {

    static get #playerLabelKey() { return `${this.key}-player-label`; }

    /**
     * @override
     */
    static get sourceKey() { return 'function'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.iurMG1TBoX3auh5z#*function'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        /** @type {string[]} */
        if (source.getFlag(MODULE_NAME, this.key)) {
            return [source.getFlag(MODULE_NAME, this.#playerLabelKey) || this.label];
        }
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF | ActionUse | ItemAction} doc
     * @returns {ItemPF[]}
     */
    static getSourcesFor(doc) {
        const item = doc instanceof pf1.documents.item.ItemPF
            ? doc
            : doc.item;

        if (!item?.actor) {
            return [];
        }

        const sources = item.actor.itemFlags?.boolean[this.key]?.sources ?? [];
        const filtered = sources.filter((source) => {
            const custom = source.getFlag(MODULE_NAME, this.key);
            const func = eval(custom);
            return !!custom && func(doc);
        });

        return filtered;
    };

    /**
     * @inheritdoc
     * @override
     * @param {object} options
     * @param {ActorPF | null | undefined} options.actor
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        if (game.user.isGM) {
            textInput({
                item,
                journal: this.journal,
                key: this.#playerLabelKey,
                parent: html,
                tooltip: this.tooltip,
            }, {
                canEdit: isEditable,
                isFormula: false,
            });
            textInput({
                item,
                journal: this.journal,
                key: this.key,
                parent: html,
                tooltip: this.tooltip,
            }, {
                canEdit: isEditable,
                isFormula: false,
            });
        }
        else {
            showEnabledLabel({
                item,
                journal: this.journal,
                key: this.key,
                label: item.getFlag(MODULE_NAME, this.#playerLabelKey) || this.label,
                parent: html,
                tooltip: this.tooltip,
            }, {
                canEdit: isEditable,
            });
        }
    }

    /** @override @returns { boolean } */
    static get gmOnlyForPicker() { return true; }
}
