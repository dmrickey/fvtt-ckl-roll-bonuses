import { textInput } from '../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { FormulaCacheHelper } from '../../util/flag-helpers.mjs';
import { localize } from '../../util/localize.mjs';
import { signed } from '../../util/to-signed-string.mjs';
import { BaseBonus } from './base-bonus.mjs';

export class VirtualSizeBonus extends BaseBonus {
    /**
     * @inheritdoc
     * @override
     */
    static get type() { return 'virtual-size'; }

    // todo figure out how to override formula used in Item list in character sheet

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const size = this.#getCachedSizeBonus(source);
        if (!size) return;

        const formula = FormulaCacheHelper.getModuleFlagFormula(source, this.key)[this.key];
        const mod = RollPF.safeRoll(formula).isDeterministic
            ? signed(size)
            : formula;

        return [localize(`${this.type}.hint`, { mod })];
    }

    /**
     * @override
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
     * @param {object} options
     * @param {ActorPF | null} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ item, html }) {
        const hasFlag = item.hasItemBooleanFlag(this.key);
        if (!hasFlag) {
            return;
        }

        textInput({
            item,
            key: this.key,
            parent: html,
            label: this.label,
        }, {
            isModuleFlag: true,
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
        return {
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
        }
    }
}
