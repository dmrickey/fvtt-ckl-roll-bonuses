import { textInput } from '../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { FormulaCacheHelper } from '../../util/flag-helpers.mjs';
import { localize } from '../../util/localize.mjs';
import { signed } from '../../util/to-signed-string.mjs';
import { BaseBonus } from './base-bonus.mjs';

export class CasterLevelBonus extends BaseBonus {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'cl'; }

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
            return [localize('cl-mod', { mod })];
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
            return [`${localize('cl-mod', { mod })} ${source.name}`];
        }
    }

    /**
     * @override
     * @inheritdoc
     * @param {object} options
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ html, item },) {
        textInput({
            item,
            key: this.key,
            label: this.label,
            parent: html,
        }, {
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
        rollData.cl ||= 0;
        rollData.cl += value;
    }
}
