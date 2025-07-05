import { MODULE_NAME } from '../../../consts.mjs';
import { textInput } from '../../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { BaseBonus } from '../../../targeted/bonuses/_base-bonus.mjs';
import { FormulaCacheHelper } from '../../../util/flag-helpers.mjs';
import { registerItemHint } from '../../../util/item-hints.mjs';
import { localizeBonusTooltip } from '../../../util/localize.mjs';

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
     * @param {ItemAction} _action
     * @param {RollData} rollData
     */
    static updateItemActionRollData(source, _action, rollData) {
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
            inputType: 'target',
        });
        textInput({
            item,
            journal: this.journal,
            key: this.#penaltyOffsetKey,
            parent: html,
            tooltip: localizeBonusTooltip(this.#penaltyOffsetKey),
        }, {
            canEdit: isEditable,
            inputType: 'target',
        });
        textInput({
            item,
            journal: this.journal,
            key: this.#incrementRangeOffsetKey,
            parent: html,
            tooltip: localizeBonusTooltip(this.#incrementRangeOffsetKey),
        }, {
            canEdit: isEditable,
            inputType: 'target',
        });
        textInput({
            item,
            journal: this.journal,
            key: this.#maxIncrementOffsetKey,
            parent: html,
            tooltip: localizeBonusTooltip(this.#maxIncrementOffsetKey),
        }, {
            canEdit: isEditable,
            inputType: 'target',
        });
    }

    /**
     *
     * @param {ItemHintsAPI["HintClass"]} hintCls
     * @param {Nullable<ActorPF>} _actor
     * @param {ItemPF} item
     * @param {object} _data
     * @return {Hint | undefined}
     */
    static handleHint(hintCls, _actor, item, _data) {
        if (!this.isSource(item)) return;
        return hintCls.create('', [], { icon: 'ra ra-archery-target', hint: this.label });
    }

    /**
     * Get Item Hints tooltip value
     *
     * @override
     * @param {ItemPF} _source The source of the bonus
     * @param {(ActionUse | ItemPF | ItemAction)?} [target] The target for contextually aware hints
     * @returns {Nullable<string[]>}
     */
    static getHints(_source, target = undefined) {
        if (!target) return;

        return [this.label];
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

        // doing this instead of `getHints` because this way I can add an icon
        registerItemHint(this.handleHint.bind(this));
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {Formula} incrementPenaltyOffsetKey
     * @param {Formula} penaltyOffsetKey
     * @param {Formula} incrementRangeOffsetKey
     * @param {Formula} maxIncrementOffsetKey
     * @returns {Promise<void>}
     */
    static async configure(
        item,
        incrementPenaltyOffsetKey,
        penaltyOffsetKey,
        incrementRangeOffsetKey,
        maxIncrementOffsetKey,
    ) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.#incrementPenaltyOffsetKey]: incrementPenaltyOffsetKey + '',
                    [this.#penaltyOffsetKey]: penaltyOffsetKey + '',
                    [this.#incrementRangeOffsetKey]: incrementRangeOffsetKey + '',
                    [this.#maxIncrementOffsetKey]: maxIncrementOffsetKey + '',
                },
            },
        });
    }
}
