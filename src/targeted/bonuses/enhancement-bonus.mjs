import { MODULE_NAME } from '../../consts.mjs';
import { checkboxInput } from '../../handlebars-handlers/bonus-inputs/chekbox-input.mjs';
import { textInput } from '../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { conditionalModToItemChange } from '../../util/conditional-helpers.mjs';
import { FormulaCacheHelper } from '../../util/flag-helpers.mjs';
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
                modifier: 'untyped',
                sort: -100,
            });
        }

        return sources;
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @param {ActionUse | ItemAction} action
     * @returns {Nullable<ItemConditional>}
     */
    static getConditional(source, action) {
        const bonus = this.#getEnhancementBonus(source, action);
        if (bonus) {
            const conditional = this.#createConditional(bonus.attack, bonus.damage, source.name);
            return conditional.modifiers?.length
                ? conditional
                : null;
        }
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

        const conditional = this.getConditional(source, action);
        if (!conditional) {
            return sources;
        }

        sources = (conditional.modifiers ?? [])
            .filter((mod) => mod.target === 'damage')
            .map((mod) => conditionalModToItemChange(conditional, mod, { isDamage: true }))
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

        const enh = FormulaCacheHelper.getModuleFlagValue(source, this.key);
        if (enh) {
            const mod = signed(enh);
            hints.push(localize('enh-mod', { mod }));
        }
        const stacks = FormulaCacheHelper.getModuleFlagValue(source, this.key);
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
     * @param {ItemPF} source
     * @param {ItemAction} action
     * @param {RollData} rollData
     */
    static updateItemActionRollData(source, action, rollData) {
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
        const enh = FormulaCacheHelper.getModuleFlagValue(source, this.key);
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

        const attackIncrease = stackingEnh + (currentMasterwork
            ? currentEnh
                ? (enh - currentEnh)
                : (enh - 1)
            : enh);
        const damageIncrease = enh - currentEnh + stackingEnh;

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
                damageType: { custom: '', values: ['untyped'] },
                formula: `${attackBonus}`,
                subTarget: 'allAttack',
                target: 'attack',
                type: pf1.config.damageTypes.untyped,
            });
        }
        if (damageBonus) {
            modifiers.push({
                _id: foundry.utils.randomID(),
                critical: 'normal',
                damageType: { custom: '', values: ['untyped'] },
                formula: `${damageBonus}`,
                subTarget: 'allDamage',
                target: 'damage',
                type: pf1.config.damageTypes.untyped,
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
