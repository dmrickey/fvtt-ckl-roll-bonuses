import { textInput } from '../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { FormulaCacheHelper } from '../../util/flag-helpers.mjs';
import { localize } from '../../util/localize.mjs';
import { signed } from '../../util/to-signed-string.mjs';
import { BaseBonus } from './base-bonus.mjs';

export class DCBonus extends BaseBonus {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'dc'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#dc'; }

    /**
     * @override
     * @inheritdoc
     */
    static init() {
        FormulaCacheHelper.registerModuleFlag(this.key);
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const value = FormulaCacheHelper.getModuleFlagValue(source, this.key);
        if (value) {
            const mod = signed(value);
            return [localize('dc-mod', { mod })];
        }
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @param {RollData} _rollData
     * @returns {Nullable<string[]>}
     */
    static getItemChatCardInfo(source, _rollData) {
        const value = FormulaCacheHelper.getModuleFlagValue(source, this.key);
        if (value) {
            const mod = signed(value);
            return [`${localize('dc-mod', { mod })} (${source.name})`];
        }
    }

    /**
     * @override
     * @inheritdoc
     * @param {object} options
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item },) {
        textInput({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            isModuleFlag: true,
        });
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @param {ItemAction} action
     * @param {RollData} rollData
     */
    static updateItemActionRollData(source, action, rollData) {
        if (!(action instanceof pf1.components.ItemAction)) {
            return;
        }

        const { actor, item } = action;
        const value = FormulaCacheHelper.getModuleFlagValue(source, this.key);
        if (!actor
            || !value
            || !(item instanceof pf1.documents.item.ItemSpellPF)
            || !rollData
        ) {
            return;
        }
        rollData.dcBonus ||= 0;
        rollData.dcBonus += value;
    }
}
