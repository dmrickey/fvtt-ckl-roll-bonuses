import { MODULE_NAME } from '../../consts.mjs';
import { showLabel } from '../../handlebars-handlers/bonus-inputs/show-label.mjs';
import { textInput } from '../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { FormulaCacheHelper } from '../../util/flag-helpers.mjs';
import { localize } from '../../util/localize.mjs';
import { signed } from '../../util/to-signed-string.mjs';
import { BaseBonus } from './_base-bonus.mjs';

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
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @param {{base: number, stacks: number}} seed
     * @param {ItemAction} action
     */
    static itemActionEnhancementBonus(source, seed, action) {
        const baseEnh = FormulaCacheHelper.getModuleFlagValue(source, this.key);
        const stackingEnh = FormulaCacheHelper.getModuleFlagValue(source, this.#stacksKey);

        seed.base = Math.max(seed.base, baseEnh);
        seed.stacks += stackingEnh;
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
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {object} options
     * @param {Formula} [options.enh]
     * @param {Formula} [options.stacking]
     * @returns {Promise<void>}
     */
    static async configure(item, { enh, stacking }) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: (enh || '') + '',
                    [this.#stacksKey]: (stacking || '') + '',
                },
            },
        });
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
        showLabel({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
        }, {
            inputType: 'bonus',
        });
        textInput({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
        }, {
            canEdit: isEditable,
            inputType: 'bonus',
            isSubLabel: true,
        });
        textInput({
            item,
            journal: this.journal,
            key: this.#stacksKey,
            parent: html,
        }, {
            canEdit: isEditable,
            inputType: 'bonus',
            isSubLabel: true,
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

        // enhancement bonus is fetched from either the item or the action when the attack/damage itself is rolled - not used from rollData
        return;
    }

    // leaving this here because it's a good example
    // /**
    //  * @param {number} attackBonus
    //  * @param {number} damageBonus
    //  * @param {string} name
    //  * @returns {ItemConditional}
    //  */
    // static #createConditional(attackBonus, damageBonus, name) {
    //     /** @type {ItemConditionalModifier[]} */
    //     const modifiers = [];
    //     if (attackBonus) {
    //         modifiers.push({
    //             _id: foundry.utils.randomID(),
    //             critical: 'normal',
    //             damageType: { custom: '', values: [''] },
    //             formula: `${attackBonus}`,
    //             subTarget: 'allAttack',
    //             target: 'attack',
    //             type: `${pf1.config.bonusTypes.enh}+`,
    //         });
    //     }
    //     if (damageBonus) {
    //         modifiers.push({
    //             _id: foundry.utils.randomID(),
    //             critical: 'normal',
    //             damageType: { custom: name, values: [] },
    //             formula: `${damageBonus}`,
    //             subTarget: 'allDamage',
    //             target: 'damage',
    //             type: `${pf1.config.bonusTypes.enh}+`,
    //         });
    //     }
    //     return {
    //         _id: foundry.utils.randomID(),
    //         default: true,
    //         name,
    //         modifiers,
    //     }
    // }
}
