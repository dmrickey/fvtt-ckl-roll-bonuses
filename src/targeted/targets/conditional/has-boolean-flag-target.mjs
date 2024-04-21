import { MODULE_NAME } from '../../../consts.mjs';
import { textInput } from '../../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { hasAnyBFlag } from '../../../util/flag-helpers.mjs';
import { BaseTarget } from '../base-target.mjs';

/**
 * @extends {BaseTarget}
 */
export class HasBooleanFlagTarget extends BaseTarget {
    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'has-boolean-flag'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#has-boolean-flag'; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
    */
    static getHints(source) {
        const value = source.getFlag(MODULE_NAME, this.key);
        if (value) {
            return value;
        }
    }

    /**
     * @override
     * @inheritdoc
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

        const allSources = item.actor.itemFlags.boolean[this.key]?.sources ?? [];
        const filteredSources = allSources.filter((source) => {
            /** @type {string} */
            const value = source.getFlag(MODULE_NAME, this.key);
            if (!value) {
                return false;
            }

            return hasAnyBFlag(item.actor, value);
        });

        return filteredSources;
    }

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
     * @inheritdoc
     * @param {object} options
     * @param {ActorPF | null | undefined} options.actor
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        textInput({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
            tooltip: this.tooltip,
        }, {
            isFormula: false,
            isModuleFlag: true,
            canEdit: isEditable,
        });
    }
}
