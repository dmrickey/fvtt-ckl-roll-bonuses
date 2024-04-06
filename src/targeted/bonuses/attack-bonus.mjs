import { textInput } from "../../handlebars-handlers/bonus-inputs/text-input.mjs";
import { FormulaCacheHelper } from "../../util/flag-helpers.mjs";
import { signed } from "../../util/to-signed-string.mjs";
import { BaseBonus } from "./base-bonus.mjs";

/**
 * @extends BaseBonus
 */
export class AttackBonus extends BaseBonus {
    /**
     * @inheritdoc
     * @override
     */
    static get sourceKey() { return 'attack'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#attack'; }

    /**
     * Register Item Hint on bonus
     *
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const formula = FormulaCacheHelper.getModuleFlagFormula(source, this.key)[this.key];
        const roll = RollPF.safeRoll(formula);

        return roll.isNumber && roll.total
            ? [`${signed(roll.total)}`]
            : [`${formula}`];
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
