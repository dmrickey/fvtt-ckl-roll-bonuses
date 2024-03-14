import { textInput } from "../../handlebars-handlers/bonus-inputs/text-input.mjs";
import { FormulaCacheHelper } from "../../util/flag-helpers.mjs";
import { BaseBonus } from "./base-bonus.mjs";

/**
 * @extends BaseBonus
 */
export class AttackBonus extends BaseBonus {
    /**
     * @inheritdoc
     * @override
     */
    static get type() { return 'attack'; }

    /**
     * Register Item Hint on bonus
     *
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const formula = FormulaCacheHelper.getModuleFlagFormula(source, this.key)[this.key];
        if (formula) {
            return [`${formula}`];
        }
    }

    /**
     * @override
     * @param {ItemPF} targetSource
     * @returns {ModifierSource[]}
     */
    static getAttackSourcesForTooltip(targetSource) {
        const /** @type {ModifierSource[]} */ sources = [];

        const value = this.#getAttackBonus(targetSource);
        if (value) {
            sources.push({
                value,
                name: targetSource.name,
                modifier: 'untyped',
                sort: -100,
            });
        }

        return sources;
    }

    /**
     * @override
     * @param {ItemPF} targetSource
     * @param {ActionUseShared} shared
     */
    static actionUseAlterRollData(targetSource, shared) {
        const value = this.#getAttackBonus(targetSource);
        if (value) {
            shared.attackBonus.push(`${value}[${targetSource.name}]`);
        }
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
    static #getAttackBonus(item) {
        const value = FormulaCacheHelper.getModuleFlagValue(item, this.key);
        return value;
    }

    /**
     * @override
     */
    static init() {
        FormulaCacheHelper.registerModuleFlag(this.key);
    }
}
