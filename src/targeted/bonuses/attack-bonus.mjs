import { MODULE_NAME } from '../../consts.mjs';
import { textInputAndKeyValueSelect } from '../../handlebars-handlers/bonus-inputs/text-input-and-key-value-select.mjs';
import { handleBonusTypeFor } from '../../target-and-bonus-join.mjs';
import { createChange } from '../../util/conditional-helpers.mjs';
import { FormulaCacheHelper } from "../../util/flag-helpers.mjs";
import { signed } from "../../util/to-signed-string.mjs";
import { BaseBonus } from "./base-bonus.mjs";

/** @extends BaseBonus */
export class AttackBonus extends BaseBonus {
    static get #typeKey() { return `${this.key}-type`; }

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'attack'; }

    /**
     * @override
     * @inheritdoc
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
        const value = this.#getAttackBonus(source);
        if (!value && !formula) return;

        const roll = RollPF.create((formula + '') || '0');

        return roll.isDeterministic
            ? [`${signed(value)}`]
            : [`${formula}`];
    }

    static {
        /**
         * @this {ItemAction}
         * @param {() => ItemChange[]} wrapped
         */
        function itemAction_attackSources(wrapped) {
            const attackSources = wrapped() || [];
            handleBonusTypeFor(
                this,
                AttackBonus,
                (bonusType, sourceItem) => {
                    const value = bonusType.#getAttackBonus(sourceItem);
                    const type = bonusType.#getAttackBonusType(sourceItem);
                    if (value) {
                        const typeName = pf1.config.bonusTypes[type] || type;
                        const name = `${sourceItem.name} (${typeName})`
                        const change = createChange({
                            value,
                            target: 'attack',
                            type,
                            name,
                        });
                        attackSources.push(change);
                    }
                }
            );
            return attackSources;
        };
        Hooks.once('init', () => {
            libWrapper.register(MODULE_NAME, 'pf1.components.ItemAction.prototype.attackSources', itemAction_attackSources, libWrapper.WRAPPER);
        });
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
        // textInput({
        //     item,
        //     journal: this.journal,
        //     key: this.key,
        //     parent: html,
        //     tooltip: this.tooltip,
        // }, {
        //     canEdit: isEditable,
        //     inputType: 'bonus',
        // });
        textInputAndKeyValueSelect({
            item,
            label: this.label,
            journal: this.journal,
            text: { key: this.key },
            select: { key: this.#typeKey, choices: pf1.config.bonusTypes },
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
    static #getAttackBonus(item) {
        const value = FormulaCacheHelper.getModuleFlagValue(item, this.key);
        return value;
    }

    /**
     * @param {ItemPF} item
     * @return {BonusTypes}
     */
    static #getAttackBonusType(item) {
        const t = item.getFlag(MODULE_NAME, this.#typeKey);
        return t || 'untyped';
    }

    /**
     * @override
     * @inheritdoc
     */
    static init() {
        FormulaCacheHelper.registerModuleFlag(this.key);
    }
}
