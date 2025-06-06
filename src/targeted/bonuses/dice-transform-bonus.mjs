import { MODULE_NAME } from '../../consts.mjs';
import { textInput } from '../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { handleBonusesFor } from '../../target-and-bonus-join.mjs';
import { localizeBonusTooltip } from '../../util/localize.mjs';
import { simplify } from '../../util/simplify-roll-formula.mjs';
import { BaseBonus } from './_base-bonus.mjs';

export class DiceTransformBonus extends BaseBonus {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'dice-transform'; }
    static get #priorityKey() { return `${this.key}-priority`; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#dice-transform'; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} item
     * @param {RollData} rollData
     */
    static prepareSourceData(item, rollData) {
        const modification = item.getFlag(MODULE_NAME, this.key);
        if (modification) {
            item[MODULE_NAME][this.key] = Roll.replaceFormulaData(modification, { item: rollData.item, class: rollData.class });
        }
    }

    /**
     * @param {ItemAction} action
     * @param {RollData} rollData
     * @param {PreDamageRollPart[]} parts
     * @param {ItemChange[]} [_changes]
     */
    static async preDamageRoll(action, rollData, parts, _changes) {
        /** @type {ItemPF[]} */
        const sourceItems = [];
        handleBonusesFor(
            action,
            (_bonusType, sourceItem) => sourceItems.push(sourceItem),
            { specificBonusType: DiceTransformBonus },
        );

        sourceItems.sort((a, b) => {
            const left = +a.getFlag(MODULE_NAME, DiceTransformBonus.#priorityKey) || 0;
            const right = +b.getFlag(MODULE_NAME, DiceTransformBonus.#priorityKey) || 0;
            return right - left;
        });

        sourceItems.forEach((source) => {
            const formula = parts[0].base;
            const transformed = DiceTransformBonus.transformFormula(rollData, formula, source);
            if (transformed) {
                parts[0].base = transformed;
            }
        });
    }

    static {
        Hooks.on('pf1PreDamageRoll', DiceTransformBonus.preDamageRoll);
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @param {ItemPF} item
     * @returns {Nullable<string[]>}
     */
    static getHints(source, item) {
        if (!item) {
            return [source.getFlag(MODULE_NAME, this.key)];
        }
        else {
            return [this.label];
        }
    }

    /**
     * @param {RollData} rollData
     * @param {string} formula
     * @param {ItemPF} source
     * @returns {string | undefined}
     */
    static transformFormula(rollData, formula, source) {
        /** @type {string} */
        const modification = source[MODULE_NAME][this.key];
        if (!modification) return;

        if (!formula) return;

        const simplified = simplify(formula, rollData, { preserveFlavor: true });
        if (!simplified) return;

        const match = simplified.match(/^(\d+)d(\d+)/);
        if (match) {
            const quantity = +match[1];
            const faces = +match[2];
            const base = `${quantity}d${faces}`;
            const f = faces;
            const q = quantity;
            const qty = quantity;
            const b = base;

            const final = Roll.replaceFormulaData(modification, { ...rollData, f, q, qty, b, quantity, faces, base });

            return simplified.replace(/^(\d+)d(\d+)/, final);
        }
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {string} formula
     * @param {number} [priority]
     * @returns {Promise<void>}
     */
    static async configure(item, formula, priority) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: formula,
                    [this.#priorityKey]: priority,
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
        textInput({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
        }, {
            canEdit: isEditable,
            inputType: 'bonus',
            placeholder: '(@quantity)d(@faces)',
        });
        textInput({
            item,
            journal: this.journal,
            key: this.#priorityKey,
            parent: html,
            tooltip: localizeBonusTooltip(this.#priorityKey),
        }, {
            canEdit: isEditable,
            inputType: 'bonus',
            isFormula: false,
            isSubLabel: true,
            placeholder: '0',
            textInputType: 'number',
        });
    }
}
