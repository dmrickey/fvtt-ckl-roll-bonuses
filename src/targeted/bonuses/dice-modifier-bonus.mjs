import { MODULE_NAME } from '../../consts.mjs';
import { textInput } from '../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { handleBonusTypeFor } from '../../target-and-bonus-join.mjs';
import { LocalHookHandler, localHooks } from '../../util/hooks.mjs';
import { localizeBonusTooltip } from '../../util/localize.mjs';
import { simplify } from '../../util/simplify-roll-formula.mjs';
import { BaseBonus } from './base-bonus.mjs';

export class DiceModifierBonus extends BaseBonus {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'dice-modifier'; }
    static get #priorityKey() { return `${this.key}-priority`; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#dice-modifier'; }

    /**
     * @override
     * @inheritdoc
     */
    static init() {
        // FormulaCacheHelper.registerModuleFlag(this.key);

        LocalHookHandler.registerHandler(localHooks.prepareData, (item, rollData) => {
            const modification = item.getFlag(MODULE_NAME, this.key);
            if (modification) {
                item[MODULE_NAME][this.key] = Roll.replaceFormulaData(modification, rollData);
            }
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
        textInput({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
        }, {
            canEdit: isEditable,
            inputType: 'specific-bonus',
            // isFormula: false,
        });
        textInput({
            item,
            journal: this.journal,
            key: this.#priorityKey,
            parent: html,
            tooltip: localizeBonusTooltip(this.#priorityKey),
        }, {
            canEdit: isEditable,
            inputType: 'specific-bonus',
            isFormula: false,
            isSubLabel: true,
            // textInputType: 'number', // todo create number input hbs
        });
    }

    /**
     * @param {ItemAction} _action The action being used for context aware modifications
     * @param {RollData} rollData
     * @param {PreDamageRollPart[]} parts
     * @param {ItemChange[]} _changes
     * @param {ItemPF} source
     */
    static transformDice(_action, rollData, parts, _changes, source) {
        /** @type {string} */
        const modification = source[MODULE_NAME][this.key];
        if (!modification) return;

        const part = parts[0];
        if (!part) return;

        const formula = part.base;
        if (!formula) return;

        const simplified = simplify(formula, rollData, { preserveFlavor: true });
        if (!simplified) return;

        const match = simplified.match(/^(\d+)d(\d+)/);
        if (match) {
            const quantity = +match[1];
            const faces = +match[2];

            const final = Roll.replaceFormulaData(modification, { ...rollData, quantity, faces });

            part.base = simplified.replace(/^(\d+)d(\d+)/, final);
        }
    }

    static {
        /**
         * @param {ItemAction} action
         * @param {RollData} rollData
         * @param {PreDamageRollPart[]} parts
         * @param {ItemChange[]} changes
         */
        const preDamageRoll = async (action, rollData, parts, changes) => {
            /** @type {ItemPF[]} */
            const sourceItems = [];
            handleBonusTypeFor(
                action,
                DiceModifierBonus,
                (_bonusType, sourceItem) => sourceItems.push(sourceItem),
            );

            sourceItems.sort((a, b) => {
                const left = +a.getFlag(MODULE_NAME, DiceModifierBonus.#priorityKey) || 0;
                const right = +b.getFlag(MODULE_NAME, DiceModifierBonus.#priorityKey) || 0;
                return right - left;
            });

            sourceItems.forEach((source) =>
                DiceModifierBonus.transformDice(action, rollData, parts, changes, source));
        }
        Hooks.on('pf1PreDamageRoll', preDamageRoll);
    }
}
