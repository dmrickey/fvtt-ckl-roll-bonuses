import { textInput } from '../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { handleBonusTypeFor } from '../../target-and-bonus-join.mjs';
import { conditionalCalculator, conditionalModToItemChangeForDamageTooltip } from '../../util/conditional-helpers.mjs';
import { setCurrentEnhancementIncreases } from '../../util/enhancement-bonus-helper.mjs';
import { FormulaCacheHelper } from '../../util/flag-helpers.mjs';
import { customGlobalHooks } from '../../util/hooks.mjs';
import { localize } from '../../util/localize.mjs';
import { signed } from '../../util/to-signed-string.mjs';
import { truthiness } from '../../util/truthiness.mjs';
import { BaseBonus } from './base-bonus.mjs';

export class EnhancementBonus extends BaseBonus {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'enh'; }

    static get #stacksKey() { return `${this.key}-stacks`; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#enhancement-bonus'; }

    /**
     * @override
     * @inheritdoc
     */
    static init() {
        FormulaCacheHelper.registerModuleFlag(this.key);
        FormulaCacheHelper.registerModuleFlag(this.#stacksKey);

        /**
         * Adds conditional to action being used
         *
         * @param {ActionUse} actionUse
         */
        function actionUseHandleConditionals(actionUse) {
            let baseEnh = 0;
            let stackingEnh = 0;

            handleBonusTypeFor(
                actionUse,
                EnhancementBonus,
                (bonusType, sourceItem) => {
                    const enh = FormulaCacheHelper.getModuleFlagValue(sourceItem, bonusType.key);
                    baseEnh = Math.max(baseEnh, enh);

                    const stacks = FormulaCacheHelper.getModuleFlagValue(sourceItem, bonusType.#stacksKey);
                    stackingEnh += stacks;
                },
            );

            const item = actionUse.item;
            const isWeapon = item instanceof pf1.documents.item.ItemAttackPF || item instanceof pf1.documents.item.ItemWeaponPF;
            let currentMasterwork = false;
            let currentEnh = 0;
            if (isWeapon) {
                currentEnh = item.system.enh;
                currentMasterwork = item.system.masterwork;
            }

            const attackIncrease = Math.max(currentEnh, baseEnh, currentMasterwork ? 1 : 0) + stackingEnh - Math.max(currentEnh, currentMasterwork ? 1 : 0);
            const damageIncrease = Math.max(currentEnh, baseEnh) + stackingEnh - currentEnh;

            if (!attackIncrease && !damageIncrease) {
                return;
            }

            if (isWeapon) {
                setCurrentEnhancementIncreases(item, {
                    baseEnh: Math.max(currentEnh, baseEnh),
                    stackingEnh,
                });
            }

            const conditional = EnhancementBonus.#createConditional(attackIncrease, damageIncrease, EnhancementBonus.label);
            if (conditional.modifiers?.length) {
                conditionalCalculator(actionUse.shared, conditional);
            }
        }
        Hooks.on(customGlobalHooks.actionUseHandleConditionals, actionUseHandleConditionals);
    }

    /**
    * @override
    * @inheritdoc
    * @param {ItemPF} source
    * @param {ItemPF} item
    * @returns {ModifierSource[]}
    */
    static getAttackSourcesForTooltip(source, item) {
        const /** @type {ModifierSource[]} */ sources = [];

        const bonus = this.#getEnhancementBonus(source, item);
        if (bonus?.attack) {
            sources.push({
                value: bonus.attack,
                name: source.name,
                modifier: 'enh',
                sort: -100,
            });
        }

        return sources;
    }

    /**
     * @override
     * @param {ItemPF} source
     * @param {ItemAction} action
     * @returns {ItemChange[]}
     */
    static getDamageSourcesForTooltip(source, action) {
        /** @type {ItemChange[]} */
        let sources = [];

        const conditional = (() => {
            const bonus = this.#getEnhancementBonus(source, action);
            if (bonus) {
                const conditional = this.#createConditional(bonus.attack, bonus.damage, source.name);
                return conditional.modifiers?.length
                    ? conditional
                    : null;
            }
        })();

        if (!conditional) {
            return sources;
        }

        sources = (conditional.modifiers ?? [])
            .filter((mod) => mod.target === 'damage')
            .map((mod) => conditionalModToItemChangeForDamageTooltip(conditional, mod, { isDamage: true }))
            .filter(truthiness);

        return sources;
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const hints = [];

        const baseEnh = FormulaCacheHelper.getModuleFlagValue(source, this.key);
        const stacks = FormulaCacheHelper.getModuleFlagValue(source, this.#stacksKey);

        if (baseEnh) {
            hints.push(localize('enh-mod', { mod: baseEnh }));
        }

        if (stacks) {
            const mod = signed(stacks);
            hints.push(localize('enh-mod-stacks', { mod }));
        }

        return hints;
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
        }, {
            canEdit: isEditable,
            isModuleFlag: true,
        });
        textInput({
            item,
            journal: this.journal,
            key: this.#stacksKey,
            parent: html,
        }, {
            canEdit: isEditable,
            isModuleFlag: true,
        });
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} _source
     * @param {ItemAction} _action
     * @param {RollData} _rollData
     */
    static updateItemActionRollData(_source, _action, _rollData) {
        // just leaving this here to say this isn't possible so don't forget and try to add this in later (as of v9.6)
        // the enhancement data is only on the item within the rollData, and that's a full reference so it'll update the item in memory which will cause issues the next time the item is updated later.
        return;
    }

    /**
     * @param {ItemPF} source
     * @param {ActionUse | ItemAction | ItemPF} thing
     * @return {Nullable<{attack: number, damage: number}>}
     */
    static #getEnhancementBonus(source, thing) {
        const baseEnh = FormulaCacheHelper.getModuleFlagValue(source, this.key);
        const stackingEnh = FormulaCacheHelper.getModuleFlagValue(source, this.#stacksKey);

        const item = thing instanceof pf1.documents.item.ItemPF
            ? thing
            : thing.item;
        let currentMasterwork = false;
        let currentEnh = 0;
        if (item instanceof pf1.documents.item.ItemAttackPF || item instanceof pf1.documents.item.ItemWeaponPF) {
            currentEnh = item.system.enh;
            currentMasterwork = item.system.masterwork;
        }

        const attackIncrease = Math.max(currentEnh, baseEnh, currentMasterwork ? 1 : 0) + stackingEnh - Math.max(currentEnh, currentMasterwork ? 1 : 0);
        const damageIncrease = Math.max(currentEnh, baseEnh) + stackingEnh - currentEnh;

        if (!attackIncrease && !damageIncrease) {
            return;
        }

        return {
            attack: attackIncrease,
            damage: damageIncrease,
        };
    }

    /**
     * @param {number} attackBonus
     * @param {number} damageBonus
     * @param {string} name
     * @returns {ItemConditional}
     */
    static #createConditional(attackBonus, damageBonus, name) {
        /** @type {ItemConditionalModifier[]} */
        const modifiers = [];
        if (attackBonus) {
            modifiers.push({
                _id: foundry.utils.randomID(),
                critical: 'normal',
                damageType: { custom: '', values: [''] },
                formula: `${attackBonus}`,
                subTarget: 'allAttack',
                target: 'attack',
                type: `${pf1.config.bonusTypes.enh}+`,
            });
        }
        if (damageBonus) {
            modifiers.push({
                _id: foundry.utils.randomID(),
                critical: 'normal',
                damageType: { custom: name, values: [] },
                formula: `${damageBonus}`,
                subTarget: 'allDamage',
                target: 'damage',
                type: `${pf1.config.bonusTypes.enh}+`,
            });
        }
        return {
            _id: foundry.utils.randomID(),
            default: true,
            name,
            modifiers,
        }
    }
}
