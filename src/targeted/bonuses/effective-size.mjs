import { textInput } from '../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { FormulaCacheHelper } from '../../util/flag-helpers.mjs';
import { localize } from '../../util/localize.mjs';
import { signed } from '../../util/to-signed-string.mjs';
import { BaseBonus } from './base-bonus.mjs';

/** @extends BaseBonus */
export class EffectiveSizeBonus extends BaseBonus {
    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'effective-size'; }

    /**
     * @override
     * @inheritdoc
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#effective-size'; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const formula = FormulaCacheHelper.getModuleFlagFormula(source, this.key)[this.key];
        const size = this.#getCachedSizeBonus(source);
        if (!size && !formula) return;

        const roll = RollPF.create((formula + '') || '0');
        const mod = roll.isDeterministic
            ? signed(size)
            : formula;

        return [localize(`${this.sourceKey}.hint`, { mod })];
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} target
     * @returns {Nullable<ItemConditional>}
     */
    static getConditional(target) {
        const size = this.#getCachedSizeBonus(target);
        if (!size) return

        const conditional = this.#createConditional(size, target.name);
        return conditional;
    }

    /**
     * @override
     * @inheritdoc
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
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'bonus',
        });
    }

    /**
     * @param {ItemPF} item
     * @return {number}
     */
    static #getCachedSizeBonus(item) {
        const value = FormulaCacheHelper.getModuleFlagValue(item, this.key);
        return value;
    }

    /**
     * @override
     */
    static init() {
        FormulaCacheHelper.registerModuleFlag(this.key);
    }

    /**
     * @param {number} bonus
     * @param {string} name
     * @returns {ItemConditional}
     */
    static #createConditional(bonus, name) {
        return new pf1.components.ItemConditional({
            _id: foundry.utils.randomID(),
            default: true,
            name,
            modifiers: [{
                _id: foundry.utils.randomID(),
                critical: '',
                damageType: { values: [], custom: '' },
                formula: `${bonus}`,
                subTarget: '',
                target: 'size',
                type: '',
            }],
        });
    }
}
