import { MODULE_NAME } from '../../consts.mjs';
import { textInput } from '../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { BaseBonus } from './_base-bonus.mjs';

/**
 * @extends BaseBonus
 */
export class FootnoteBonus extends BaseBonus {
    /**
     * @inheritdoc
     * @override
     */
    static get sourceKey() { return 'footnote'; }

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
        if (note) {
            note = Roll.replaceFormulaData(note, { item: rollData.item, class: rollData.class });
            item[MODULE_NAME][this.key] = note;
        }
    }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        return this.getFootnotes(source)?.map(x => x.text);
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source The source of the bonus
     * @param {(ActionUse | ItemPF | ItemAction)?} [_item] The item receiving the bonus for contextually aware hints.
     * @returns {ParsedContextNoteEntry[] | undefined}
     */
    static getFootnotes(source, _item) {
        /** @type { string } */
        const text = source[MODULE_NAME][this.key];
        if (text) {
            return [{ text, source: source.name }];
        }
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {string} note
     * @returns {Promise<void>}
     */
    static async configure(item, note) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: { [this.key]: note || '' },
            },
        });
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
            inputType: 'bonus',
            isFormula: false,
        });
    }
}
