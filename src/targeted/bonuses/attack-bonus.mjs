import { textInput } from "../../handlebars-handlers/bonus-inputs/text-input.mjs";
import { FormulaCacheHelper } from "../../util/flag-helpers.mjs";
import { signed } from "../../util/to-signed-string.mjs";
import { BaseBonus } from "./base-bonus.mjs";

/**
 * @extends BaseBonus
 */
export class AttackBonus extends BaseBonus {
    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'attack'; }

    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#attack'; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const formula = FormulaCacheHelper.getModuleFlagFormula(source, this.key)[this.key];
        const roll = RollPF.create(formula + '');

        return roll.isDeterministic
            ? [`${signed(roll.evaluate({ async: false }).total)}`]
            : [`${formula}`];
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {ModifierSource[]}
     */
    static getAttackSourcesForTooltip(source) {
        const /** @type {ModifierSource[]} */ sources = [];

        const value = this.#getAttackBonus(source);
        if (value) {
            sources.push({
                value,
                name: source.name,
                modifier: 'untyped',
                sort: -100,
            });
        }

        return sources;
    }

    /**
     * @override
     * @inheritdoc
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
     * @inheritdoc
     */
    static init() {
        FormulaCacheHelper.registerModuleFlag(this.key);
    }
}
