import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { BaseTargetOverride } from './_base-target-override.mjs';

/** @extends {BaseTargetOverride} */
export class FinesseOverride extends BaseTargetOverride {
    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'finesse-override'; }

    /**
     * @override
     * @inheritdoc
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.fzOO7K3iPTrSolY1#finesse'; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} _source
     * @returns {Nullable<string[]>}
     */
    static getHints(_source) {
        return [this.label];
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} item
     * @returns { boolean }
     */
    static isInvalidItemType(item) {
        return item instanceof pf1.documents.item.ItemWeaponPF;
    }

    /**
     * @override
     * @param {ItemPF} item
     * @param {RollData} _rollData
     */
    static prepareSourceData(item, _rollData) {
        item.system.properties ||= {};
        item.system.properties.fin = true;
    }

    /**
     * @override
     * @inheritdoc
     * @param {object} options
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        showEnabledLabel({
            item,
            journal: this.journal,
            key: this.key,
            label: this.label,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'target-override',
        });
    }
}
