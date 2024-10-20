import { MODULE_NAME } from "../../consts.mjs";
import { loadConditionals, modifiersInput } from "../../handlebars-handlers/targeted/bonuses/conditional-modifiers-input.mjs";
import { handleBonusTypeFor } from '../../target-and-bonus-join.mjs';
import { addCheckToAttackDialog, getFormData } from '../../util/attack-dialog-helper.mjs';
import { conditionalAttackTooltipModSource, conditionalModToItemChangeForDamageTooltip } from "../../util/conditional-helpers.mjs";
import { LocalHookHandler, localHooks } from '../../util/hooks.mjs';
import { truthiness } from "../../util/truthiness.mjs";
import { uniqueArray } from '../../util/unique-array.mjs';
import { BaseBonus } from "./base-bonus.mjs";

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
     */
    static init() {
        LocalHookHandler.registerHandler(localHooks.prepareData, (item, rollData) => {
            const conditionals = loadConditionals(item, this.key)
                .filter(x => x.data.modifiers.length && x.data.modifiers.find((m) => !!m.formula && !!m.target));
            conditionals.forEach((c) => {
                c.data.modifiers.forEach((m) => {
                    item[MODULE_NAME][this.key] ||= [];
                    item[MODULE_NAME][this.key].conditionals ||= { [c.id]: {} };

                    const roll = RollPF.create(m.formula, rollData);
                    item[MODULE_NAME][this.key].conditionals[c.id][m._id] = roll.simplifiedFormula;
                });
            });
        });
    }

    /**
     * @param {ItemPF} item
     * @returns {ItemConditional[]}
     */
    static loadConfiguredConditionals(item) {
        const conditionals = loadConditionals(item, this.key, { useCachedFormula: true })
            .filter(x => x.data.modifiers.length && x.data.modifiers.find((m) => !!m.formula && !!m.target));
        return conditionals;
    }

    /**
     * @override
     * @param {ItemPF} target
     * @param {ActionUse | ItemAction} [action] The thing for the source is being applied to for contextually aware bonuses
     * @returns {Nullable<ItemConditional[]>}
     */
    static getConditionals(target, action) {
        if (!(action instanceof pf1.actionUse.ActionUse)) return;

        const conditionals = this.loadConfiguredConditionals(target)
            .filter((c) => {
                if (action instanceof pf1.actionUse.ActionUse) {
                    const formData = getFormData(action, c.id);
                    if (typeof formData === 'boolean') {
                        return formData;
                    }
                }
                return c.data.default;
            });

        return conditionals;
    }

    //     /**
    //      * @override
    //      * @param {ItemPF} target
    //      * @returns {ItemChange[]}
    //      */
    //     static getDamageSourcesForTooltip(target) {
    //         /** @type {ItemChange[]} */
    //         let sources = [];
    //
    //         const conditional = this.getConditional(target);
    //         if (!conditional) {
    //             return sources;
    //         }
    //
    //         sources = (conditional.modifiers ?? [])
    //             .filter((mod) => mod.target === 'damage')
    //             .map((mod) => conditionalModToItemChangeForDamageTooltip(conditional, mod, { isDamage: true }))
    //             .filter(truthiness);
    //
    //         return sources;
    //     }

    //     /**
    //      * @override
    //      * @param {ItemPF} target
    //      * @returns {ModifierSource[]}
    //      */
    //     static getAttackSourcesForTooltip(target) {
    //         /** @type {ModifierSource[]} */
    //         let sources = [];
    //
    //         if (!target.actor) {
    //             return sources;
    //         }
    //
    //         const conditional = this.getConditional(target);
    //         if (!conditional) {
    //             return sources;
    //         }
    //
    //         sources = (conditional.modifiers ?? [])
    //             .filter((mod) => mod.target === 'attack')
    //             .map((mod) => conditionalAttackTooltipModSource(conditional, mod))
    //             .filter(truthiness);
    //
    //         return sources;
    //     }

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

        handleBonusTypeFor(
            dialog.action,
            ConditionalModifiersBonus,
            (bonusType, sourceItem) => {
                const conditionals = bonusType.loadConfiguredConditionals(sourceItem);
                conditionals.forEach((c) => {
                    addCheckToAttackDialog(
                        html,
                        c.id,
                        dialog,
                        {
                            checked: c.data.default,
                            isConditional: true,
                            label: uniqueArray([sourceItem.name, c.name].filter(truthiness)).join(' - '),
                        }
                    )
                })
            }
        );
    }

    static {
        Hooks.on('renderApplication', this.addConditionalModifierToDialog);
    }
}
