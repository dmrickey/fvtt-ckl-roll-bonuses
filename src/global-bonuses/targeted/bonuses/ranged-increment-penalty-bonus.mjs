import { textInput } from '../../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { BaseBonus } from '../../../targeted/bonuses/base-bonus.mjs';
import { FormulaCacheHelper } from '../../../util/flag-helpers.mjs';
import { registerItemHint } from '../../../util/item-hints.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../../../util/localize.mjs';

/**
 * @extends BaseBonus
 */
export class RangedIncrementPenaltyBonus extends BaseBonus {
    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'ranged-increment-penalty'; }

    static get #incrementPenaltyOffsetKey() { return `${this.key}-increment-penalty-offset`; }
    static get #incrementRangeOffsetKey() { return `${this.key}-increment-range-offset`; }
    static get #maxIncrementOffsetKey() { return `${this.key}-max-increment-offset`; }
    static get #penaltyOffsetKey() { return `${this.key}-penalty-offset`; }

    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.4A4bCh8VsQVbTsAY#ranged-increment-penalty-bonus'; }

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

        const incrementRangeOffset = FormulaCacheHelper.getModuleFlagValue(source, this.#incrementRangeOffsetKey);
        if (incrementRangeOffset) {
            rollData.rb.rangePenalty.range += incrementRangeOffset;
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
            key: this.#incrementPenaltyOffsetKey,
            parent: html,
            tooltip: localizeBonusTooltip(this.#incrementPenaltyOffsetKey),
        }, {
            canEdit: isEditable,
        });
        textInput({
            item,
            journal: this.journal,
            key: this.#penaltyOffsetKey,
            parent: html,
            tooltip: localizeBonusTooltip(this.#penaltyOffsetKey),
        }, {
            canEdit: isEditable,
        });
        textInput({
            item,
            journal: this.journal,
            key: this.#incrementRangeOffsetKey,
            parent: html,
            tooltip: localizeBonusTooltip(this.#incrementRangeOffsetKey),
        }, {
            canEdit: isEditable,
        });
        textInput({
            item,
            journal: this.journal,
            key: this.#maxIncrementOffsetKey,
            parent: html,
            tooltip: localizeBonusTooltip(this.#maxIncrementOffsetKey),
        }, {
            canEdit: isEditable,
        });
    }

    /**
     *
     * @param {ItemHintsAPI["HintClass"]} hintCls
     * @param {ActorPF} _actor
     * @param {ItemPF} item
     * @param {object} _data
     * @return {Hint | undefined}
     */
    static handleHint(hintCls, _actor, item, _data) {
        if (!item.hasItemBooleanFlag(RangedIncrementPenaltyBonus.key)) return;
        return hintCls.create('', [], { icon: 'ra ra-archery-target', hint: RangedIncrementPenaltyBonus.label });
    }

    /**
     * @override
     * @inheritdoc
     */
    static init() {
        FormulaCacheHelper.registerModuleFlag(
            this.#incrementPenaltyOffsetKey,
            this.#incrementRangeOffsetKey,
            this.#maxIncrementOffsetKey,
            this.#penaltyOffsetKey,
        );
        registerItemHint(this.handleHint);
    }
}
