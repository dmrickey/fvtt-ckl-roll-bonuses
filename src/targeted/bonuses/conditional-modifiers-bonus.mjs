import { MODULE_NAME } from "../../consts.mjs";
import { modifiersInput } from "../../handlebars-handlers/targeted/bonuses/conditional-modifiers-input.mjs";
import { handleBonusesFor } from '../../target-and-bonus-join.mjs';
import { addCheckToAttackDialog, getFormData } from '../../util/attack-dialog-helper.mjs';
import { conditionalAttackTooltipModSource, conditionalModToItemChangeForDamageTooltip, loadConditionals } from "../../util/conditional-helpers.mjs";
import { truthiness } from "../../util/truthiness.mjs";
import { uniqueArray } from '../../util/unique-array.mjs';
import { BaseBonus } from "./_base-bonus.mjs";

/**
 * @extends BaseBonus
 */
export class ConditionalModifiersBonus extends BaseBonus {
    /**
     * @inheritdoc
     * @override
     */
    static get sourceKey() { return 'conditional-modifiers'; }

    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#conditional-modifiers'; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} item
     * @param {RollData} rollData
     */
    static prepareSourceData(item, rollData) {
        let conditionals = loadConditionals(item, this.key);
        conditionals = conditionals.filter(x => x._source.modifiers.length && x._source.modifiers.find((m) => !!m.formula && !!m.target));
        conditionals.forEach((c) => {
            c._source.modifiers.forEach((m) => {
                item[MODULE_NAME][this.key] ||= [];
                item[MODULE_NAME][this.key].conditionals ||= {};
                item[MODULE_NAME][this.key].conditionals[c.id] ||= {};

                const formula = Roll.replaceFormulaData(m.formula, { item: rollData.item, class: rollData.class });
                item[MODULE_NAME][this.key].conditionals[c.id][m._id] = formula;
            });
        });
    }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const hints = this.loadConfiguredConditionals(source)
            .map(x => x.name)
            .filter(truthiness);
        return hints;
    }

    /**
     * @param {ItemPF} item
     * @returns {ItemConditional[]}
     */
    static loadConfiguredConditionals(item) {
        const conditionals = loadConditionals(item, this.key, { useCachedFormula: true })
            .filter(x => x._source.modifiers.length && x._source.modifiers.find((m) => !!m.formula && !!m.target));
        return conditionals;
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} target
     * @param {ActionUse | ItemAction} [action] The thing for the source is being applied to for contextually aware bonuses
     * @returns {ItemConditional[]}
     */
    static getConditionals(target, action) {
        const conditionals = this.loadConfiguredConditionals(target)
            .filter((c) => {
                if (action instanceof pf1.actionUse.ActionUse) {
                    const formData = getFormData(action, c.id);
                    if (typeof formData === 'boolean') {
                        return formData;
                    }
                }
                return c._source.default;
            });

        return conditionals;
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} target
     * @returns {ItemChange[]}
     */
    static getDamageSourcesForTooltip(target) {
        const conditionals = this.getConditionals(target);
        const sources = conditionals
            .map((c) => c._source)
            .filter((c) => c.default)
            .flatMap((cd) => cd.modifiers
                .filter((mod) => mod.target === 'damage')
                .map((mod) => conditionalModToItemChangeForDamageTooltip(cd, mod, { isDamage: true }))
            )
            .filter(truthiness);

        return sources;
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} target
     * @returns {ModifierSource[]}
     */
    static getAttackSourcesForTooltip(target) {
        if (!target.actor) {
            return [];
        }

        const conditionals = this.getConditionals(target);
        const sources = conditionals
            .map((c) => c._source)
            .filter((c) => c.default)
            .flatMap((cd) => cd.modifiers
                .filter((mod) => mod.target === 'attack')
                .map((mod) => conditionalAttackTooltipModSource(cd, mod))
            )
            .filter(truthiness);

        return sources;
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @param {ItemAction} action
     * @returns {number}
     */
    static modifyActionLabelDC(source, action) {
        const conditionals = this.loadConfiguredConditionals(source);
        const bonus = conditionals
            .map((c) => c._source)
            .filter((c) => c.default)
            .flatMap((cd) => cd.modifiers
                .filter((mod) => mod.target === 'dc')
                .map((mod) => mod.formula?.trim())
            )
            .filter(truthiness)
            .reduce((acc, formula) => acc + RollPF.safeTotal(formula), 0);
        return bonus;
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {ItemConditionalSourceData[]} conditionals
     * @returns {Promise<void>}
     */
    static async configure(item, conditionals) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: { [this.key]: conditionals },
            },
        });
    }

    /**
     * @override
     * @param {object} options
     * @param {ActorPF | null} options.actor
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        modifiersInput({
            item,
            key: this.key,
            parentElement: html,
            journal: this.journal,
        }, {
            canEdit: isEditable,
        });
    }

    /**
     * @this {ActionUse}
     * @param {AttackDialog} dialog
     * @param {[HTMLElement]} html
     * @param {AttackDialogData} data
     */
    static addConditionalModifierToDialog(dialog, [html], data) {
        if (!(dialog instanceof pf1.applications.AttackDialog)) {
            return;
        }

        handleBonusesFor(
            dialog.action,
            (bonusType, sourceItem) => {
                const conditionals = bonusType.loadConfiguredConditionals(sourceItem);
                conditionals.forEach((c) => {
                    addCheckToAttackDialog(
                        html,
                        c.id,
                        dialog,
                        {
                            checked: c._source.default,
                            isConditional: true,
                            label: uniqueArray([sourceItem.name, c.name].filter(truthiness)).join(' - '),
                        }
                    )
                })
            },
            { specificBonusType: ConditionalModifiersBonus },
        );
    }

    static {
        Hooks.on('renderApplication', this.addConditionalModifierToDialog);
    }
}
