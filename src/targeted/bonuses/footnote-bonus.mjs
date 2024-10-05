import { MODULE_NAME } from '../../consts.mjs';
import { textInput } from '../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { BaseBonus } from './base-bonus.mjs';

/**
 * @extends BaseBonus
 */
export class FootnoteBonus extends BaseBonus {
    /**
     * @inheritdoc
     * @override
     */
    static get sourceKey() { return 'footnote'; }

    // TODO VERIFY JOURNAL LINK
    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#footnotes'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {RollData} rollData
     */
    static prepareSourceData(item, rollData) {
        let note = item.getFlag(MODULE_NAME, this.key);
        if (!note) {
            return;
        }

        const r = /\[\[([^\[].+?)\]\]/g;
        const matches = [...note.matchAll(r)];

        // const simplified = [];
        matches.forEach(([_, match]) => {
            const roll = RollPF.create(match, rollData);
            note = note.replace(match, roll.simplifiedFormula);
        });

        item[MODULE_NAME][this.key] = note;
    }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        return this.getFootnotes(source);
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source The source of the bonus
     * @param {(ActionUse | ItemPF | ItemAction)?} [item] The item receiving the bonus for contextually aware hints.
     * @returns {string[] | undefined}
     */
    static getFootnotes(source, item) {
        const enriched = source[MODULE_NAME][this.key];
        if (enriched) {
            return [enriched];
        }
    }

    /**
     * @inheritdoc
     * @override
     * @param {object} options
     * @param {ActorPF | null} options.actor
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        textInput({
            item,
            journal: this.journal,
            key: this.key,
            label: this.label,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            isFormula: false,
        });
    }
}
