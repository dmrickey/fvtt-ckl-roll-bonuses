import { MODULE_NAME } from '../../consts.mjs';
import { textInput } from '../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { buildDamageMultiplierConditional } from '../../util/damage-multiplier-conditional.mjs';
import { FormulaCacheHelper } from '../../util/flag-helpers.mjs';
import { getFirstTermFormula } from '../../util/get-first-term-formula.mjs';
import { localize } from '../../util/localize.mjs';
import { signed } from '../../util/to-signed-string.mjs';
import { BaseBonus } from './_base-bonus.mjs';

export class DamageMultiplierBonus extends BaseBonus {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'damage-multiplier'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#damage-multiplier'; }

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
        /**
         * @param {string | number} mod 
         * @returns {string}
         */
        const format = (mod) => {
            if (typeof mod === 'string' && mod.startsWith('+')) {
                mod = mod.substring(1);
            }
            mod = '×' + mod;
            return localize('damage-multiplier-mod', { mod });
        };
        const hint = FormulaCacheHelper.getHint(source, this.key, format);
        if (hint) {
            return [hint];
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
            return [`${localize('damage-multiplier-mod', { mod })} (${source.name})`];
        }
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {Formula} formula
     * @returns {Promise<void>}
     */
    static async configure(item, formula) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: { [this.key]: `${formula || ''}` },
            },
        });
    }

    /**
     * @param {ItemPF} source 
     * @param {ItemConditional[]} conditionals
     * @param {ActionUse} action 
     * @returns {ItemConditional| undefined}
     */
    static buildCondtional(source, conditionals, action) {
        const multiplier = FormulaCacheHelper.getModuleFlagValue(source, this.key) || 0;
        const isNumber = !isNaN(+multiplier);
        const label = '×' + (isNumber ? multiplier : `(${multiplier})`);
        return buildDamageMultiplierConditional(action, conditionals, `${source.name} ${label}`, { includeActionDamage: true, multiplier });
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
        textInput({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'bonus',
        });
    }
}
