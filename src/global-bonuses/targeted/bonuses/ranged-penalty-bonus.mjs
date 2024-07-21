import { textInput } from '../../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { BaseBonus } from '../../../targeted/bonuses/base-bonus.mjs';
import { FormulaCacheHelper } from '../../../util/flag-helpers.mjs';
import { signed } from '../../../util/to-signed-string.mjs';

/**
 * @extends BaseBonus
 */
export class RangedPenaltyBonus extends BaseBonus {
    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'ranged-penalty'; }

    static get #incrementPenaltyOffsetKey() { return `${this.key}-increment-penalty-offset`; }
    static get #maxIncrementOffsetKey() { return `${this.key}-max-increment-offset`; }
    static get #penaltyOffsetKey() { return `${this.key}-penalty-offset`; }

    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.TODO'; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const formula = FormulaCacheHelper.getModuleFlagFormula(source, this.key)[this.key];
        const roll = RollPF.safeRollSync(formula);

        return roll.isNumber && roll.total
            ? [`${signed(roll.total)}`]
            : [`${formula}`];
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @param {ItemAction} action
     * @param {RollData} rollData
     */
    static updateItemActionRollData(source, action, rollData) {
        if (!rollData.rb.rangePenalty) {
            return;
        }

        const incrementPenaltyOffset = FormulaCacheHelper.getModuleFlagValue(source, this.#incrementPenaltyOffsetKey);
        if (incrementPenaltyOffset) {
            const offset = Math.max(0, rollData.rb.rangePenalty.penalty - Math.abs(incrementPenaltyOffset));
            rollData.rb.rangePenalty.penalty = offset;
        }

        const maxIncrementOffset = FormulaCacheHelper.getModuleFlagValue(source, this.#maxIncrementOffsetKey);
        if (maxIncrementOffset) {
            const offset = Math.max(0, rollData.rb.rangePenalty.maxIncrements + maxIncrementOffset);
            rollData.rb.rangePenalty.maxIncrements = offset;
        }

        const penaltyOffset = FormulaCacheHelper.getModuleFlagValue(source, this.#penaltyOffsetKey);
        if (penaltyOffset) {
            rollData.rb.rangePenalty.penaltyOffset += Math.abs(penaltyOffset);
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
            key: this.#maxIncrementOffsetKey,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            isModuleFlag: true,
        });
        textInput({
            item,
            journal: this.journal,
            key: this.#incrementPenaltyOffsetKey,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            isModuleFlag: true,
        });
        textInput({
            item,
            journal: this.journal,
            key: this.#penaltyOffsetKey,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            isModuleFlag: true,
        });
    }

    /**
     * @override
     * @inheritdoc
     */
    static init() {
        FormulaCacheHelper.registerModuleFlag(this.#incrementPenaltyOffsetKey, this.#maxIncrementOffsetKey, this.#penaltyOffsetKey);
    }
}
