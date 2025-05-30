import { SpecificBonus } from '../../bonuses/_specific-bonus.mjs';
import { MODULE_NAME } from '../../consts.mjs';
import { checkboxInput } from '../../handlebars-handlers/bonus-inputs/chekbox-input.mjs';
import { textInputAndKeyValueSelect } from '../../handlebars-handlers/bonus-inputs/text-input-and-key-value-select.mjs';
import { textInput } from '../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { handleBonusesFor } from '../../target-and-bonus-join.mjs';
import { changeTypeLabel } from '../../util/change-type-label.mjs';
import { createChange } from '../../util/conditional-helpers.mjs';
import { FormulaCacheHelper } from "../../util/flag-helpers.mjs";
import { LocalHookHandler, localHooks } from '../../util/hooks.mjs';
import { localize } from '../../util/localize.mjs';
import { signed } from "../../util/to-signed-string.mjs";
import { BaseBonus } from "./_base-bonus.mjs";

/** @extends BaseBonus */
export class AttackBonus extends BaseBonus {
    static get #typeKey() { return `${this.key}-type`; }
    static get #critOnlyKey() { return `${this.key}-crit-only`; }

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

    static {
        /**
         * @this {ItemAction}
         * @param {() => ItemChange[]} wrapped
         */
        function itemAction_attackSources(wrapped) {
            const attackSources = wrapped() || [];
            handleBonusesFor(
                this,
                (bonusType, sourceItem) => {
                    const critOnly = !!sourceItem.getFlag(MODULE_NAME, bonusType.#critOnlyKey);
                    if (critOnly) return;

                    const type = bonusType.#getAttackBonusType(sourceItem);
                    /** @type { string | number } */
                    let value = bonusType.#getAttackBonus(sourceItem);
                    value = LocalHookHandler.fireHookWithReturnSync(localHooks.patchChangeValue, value, type, sourceItem.actor);
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
                },
                { specificBonusType: AttackBonus, }
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
        const formula = FormulaCacheHelper.getModuleFlagFormula(source, this.key)[this.key];
        const value = this.#getAttackBonus(source);
        if (!value && !formula) return;

        const critOnly = !!source.getFlag(MODULE_NAME, this.#critOnlyKey);
        const type = this.#getAttackBonusType(source);
        const typeLabel = changeTypeLabel(type);

        const roll = RollPF.create((formula + '') || '0');

        const hint = roll.isDeterministic
            ? `${signed(value)}`
            : `${formula}`;
        return critOnly
            ? [`${hint} (${localize('PF1.CriticalConfirmBonus')})`]
            : [`${hint}[${typeLabel}]`];
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string | string[]>}
     */
    static getCritBonusParts(source) {
        const critOnly = !!source.getFlag(MODULE_NAME, this.#critOnlyKey);
        if (!critOnly) return;

        const formula = FormulaCacheHelper.getModuleFlagFormula(source, this.key)[this.key];
        const value = this.#getAttackBonus(source);
        if (!value && !formula) return;

        const roll = RollPF.create((formula + '') || '0');

        const part = roll.isDeterministic
            ? `(${signed(value)})`
            : `(${formula})`;
        return `${part}[${source.name}]`;
    }

    /**
     * @overload
     * @param {ItemPF} item
     * @param {Formula} formula
     * @param {object} options
     * @param {false | undefined} [options.critOnly]
     * @param {BonusTypes} options.bonusType
     * @returns {Promise<void>}
     */

    /**
     * @overload
     * @param {ItemPF} item
     * @param {Formula} formula
     * @param {object} options
     * @param {true} options.critOnly
     * @returns {Promise<void>}
     */

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {Formula} formula
     * @param {object} options
     * @param {boolean | undefined} [options.critOnly]
     * @param {BonusTypes | undefined} [options.bonusType]
     * @returns {Promise<void>}
     */
    static async configure(item, formula, { critOnly, bonusType }) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: (formula || '') + '',
                    [this.#critOnlyKey]: !!critOnly,
                    [this.#typeKey]: bonusType,
                },
            },
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
        const critOnly = !!item.getFlag(MODULE_NAME, this.#critOnlyKey);

        if (critOnly) {
            textInput({
                item,
                label: this.label,
                journal: this.journal,
                key: this.key,
                parent: html,
                tooltip: this.tooltip,
            }, {
                canEdit: isEditable,
                inputType: 'bonus',
            });
        }
        else {
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
        checkboxInput({
            item,
            journal: this.journal,
            key: this.#critOnlyKey,
            parent: html,
        }, {
            canEdit: isEditable,
            inputType: 'bonus',
            isSubLabel: true,
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
}
