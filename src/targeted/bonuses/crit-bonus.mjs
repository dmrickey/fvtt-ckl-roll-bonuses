import { MODULE_NAME } from '../../consts.mjs';
import { checkboxInput } from '../../handlebars-handlers/bonus-inputs/chekbox-input.mjs';
import { showLabel } from '../../handlebars-handlers/bonus-inputs/show-label.mjs';
import { textInput } from "../../handlebars-handlers/bonus-inputs/text-input.mjs";
import { handleBonusesFor } from '../../target-and-bonus-join.mjs';
import { FormulaCacheHelper } from "../../util/flag-helpers.mjs";
import { LocalHookHandler, localHooks } from '../../util/hooks.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { SelfTarget } from '../targets/self-target.mjs';
import { BaseBonus } from "./_base-bonus.mjs";

/**
 * @extends BaseBonus
 */
export class CritBonus extends BaseBonus {
    /**
     * @inheritdoc
     * @override
     */
    static get sourceKey() { return 'crit'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#critical-bonuses'; }

    static get #critKeenKey() { return `${this.key}-keen`; }
    static get #critMultKey() { return `${this.key}-mult`; }
    static get #critOffsetKey() { return `${this.key}-offset`; }

    /**
     * If the item is providing keen
     * @param {ItemPF} source
     * @returns {boolean}
     */
    static hasKeen(source) { return !!source.getFlag(MODULE_NAME, this.#critKeenKey); }

    /**
     * The value of the bonus source's mult
     * @param {ItemPF} source
     * @returns {number}
     */
    static getMultValue(source) { return FormulaCacheHelper.getModuleFlagValue(source, this.#critMultKey); }

    /**
     * The value of the bonus source's offset
     * @param {ItemPF} source
     * @returns {number}
     */
    static getOffsetValue(source) { return FormulaCacheHelper.getModuleFlagValue(source, this.#critOffsetKey); }

    /**
    * @override
    * @inheritdoc
    * @returns {boolean}
    */
    static get skipTargetedHint() { return true; }

    /**
     * @override
     */
    static init() {
        FormulaCacheHelper.registerModuleFlag(this.#critMultKey, this.#critOffsetKey);

        /**
         * @param {number} current
         * @param {ItemAction} action
         * @returns {number}
         */
        const handleItemActionCritRangeWrapper = (current, action) => {
            const { item } = action;

            if (!!item.system.broken) {
                return 20;
            }

            let hasKeen = false;
            let offset = 0;

            handleBonusesFor(
                action,
                (bonusType, sourceItem) => {
                    hasKeen ||= bonusType.hasKeen(sourceItem);
                    offset += bonusType.getOffsetValue(sourceItem);
                },
                { specificBonusType: CritBonus }
            );

            if (!offset && !hasKeen) {
                return current;
            }

            let range = hasKeen
                ? current * 2 - 21
                : current;

            range -= offset;
            range = Math.clamp(range, 2, 20);
            return range;
        }
        LocalHookHandler.registerHandler(localHooks.itemActionCritRangeWrapper, handleItemActionCritRangeWrapper);

        /**
         * @param {ItemAction} action
         * @param {RollData} rollData
         */
        const updateItemActionRollData = (action, rollData) => {
            if (!rollData.action?.ability) {
                return;
            }

            const { item } = action;
            const isBroken = !!item.system.broken;

            let hasKeen = false;
            let offset = 0;
            let mult = +rollData.action.ability.critMult || 2;

            handleBonusesFor(
                action,
                (bonusType, sourceItem) => {
                    hasKeen ||= bonusType.hasKeen(sourceItem);
                    offset += bonusType.getOffsetValue(sourceItem);
                    mult += bonusType.getMultValue(sourceItem);
                },
                { specificBonusType: CritBonus },
            );

            rollData.action.ability.critMult = isBroken ? 2 : mult;

            const current = rollData.action.ability.critRange || 20;
            let range = hasKeen
                ? current * 2 - 21
                : current;
            range -= offset;
            range = Math.clamp(range, 2, 20);
            rollData.action.ability.critRange = isBroken ? 20 : range;
        };
        LocalHookHandler.registerHandler(localHooks.updateItemActionRollData, updateItemActionRollData);

        registerItemHint((hintcls, actor, item, _data) => {
            if (!actor || !item?.defaultAction) return;

            const isBroken = !!item.system.broken;
            const action = item.defaultAction;

            let hasKeen = false;
            let offset = 0;
            const currentRange = action.ability.critRange || 20;
            let mult = action.ability?.critMult || 2;

            /** @type {string[]} */
            const sources = [];

            handleBonusesFor(
                action,
                (bonusType, sourceItem) => {
                    sources.push(sourceItem.name);
                    hasKeen ||= bonusType.hasKeen(sourceItem);
                    offset += bonusType.getOffsetValue(sourceItem);
                    mult += bonusType.getMultValue(sourceItem);
                },
                { specificBonusType: CritBonus },
            );

            let range = hasKeen
                ? currentRange * 2 - 21
                : currentRange;
            range -= offset;
            range = Math.clamp(range, 2, 20);
            range = isBroken ? 20 : range;
            mult = isBroken ? 2 : mult;

            if (mult === action.ability.critMult
                && range === action.ability.critRange
            ) return;

            const rangeFormat = range === 20 ? '20' : `${range}-20`;
            const label = `${rangeFormat}/x${mult}`;
            const hint = hintcls.create(label, [], { hint: sources.join('\n') });
            return hint;
        });

        /**
         * @param {ActionUse} action
         * @param {ParsedContextNoteEntry[]} notes
         */
        function addFootnotes({ action }, notes) {
            if (!action?.ability) {
                return;
            }

            const { item } = action;
            const isBroken = !!item.system.broken;

            let hasKeen = false;
            let offset = 0;
            const originalMult = +(action.ability.critMult || 2) || 2;
            let mult = originalMult;

            handleBonusesFor(
                action,
                (bonusType, sourceItem) => {
                    hasKeen ||= bonusType.hasKeen(sourceItem);
                    offset += bonusType.getOffsetValue(sourceItem);
                    mult += bonusType.getMultValue(sourceItem);
                },
                { specificBonusType: CritBonus },
            );

            mult = isBroken ? 2 : mult;

            const originalRange = action.ability.critRange || 20;
            let range = hasKeen
                ? originalRange * 2 - 21
                : originalRange;
            range -= offset;
            range = Math.clamp(range, 2, 20);
            range = isBroken ? 20 : range;

            if (mult !== originalMult || range !== originalRange) {
                const rangeFormat = range === 20 ? '20' : `${range}-20`;
                const hint = `${rangeFormat}/x${mult}`;
                notes.push({ text: hint });
            }
        }
        LocalHookHandler.registerHandler(localHooks.actionUseFootnotes, addFootnotes);
    }

    /**
     * Register Item Hint on bonus
     *
     * @override
     * @param {ItemPF} source
     * @param {(ActionUse | ItemPF | ItemAction)?} [target]
     * @returns {Nullable<string[]>}
     */
    static getHints(source, target = undefined) {
        if (SelfTarget.isSource(source)) {
            target = source.defaultAction;
        }

        /** @type {Nullable<ItemAction>} */
        let itemAction;
        if (target) {
            itemAction = target instanceof pf1.documents.item.ItemPF
                ? target.defaultAction
                : target instanceof pf1.components.ItemAction
                    ? target
                    : undefined;
        }

        /** @type {number} */ let originalCritMult;
        /** @type {number} */ let originalCritRange;
        /** @type {boolean} */ let isBroken;
        if (itemAction && (itemAction.ability?.critMult || 1) > 1) {
            originalCritMult = +(itemAction.ability?.critMult || 1) || 2;
            originalCritRange = itemAction.ability?.critRange || 20;
            isBroken = source.system.broken;
        } else {
            originalCritMult = 2;
            originalCritRange = 20;
            isBroken = false;
        }

        const getMult = () => {
            if (isBroken) return 2;

            const mult = originalCritMult + FormulaCacheHelper.getModuleFlagValue(source, this.#critMultKey);
            return mult;
        }

        const getRange = () => {
            if (isBroken) return 20;

            const hasKeen = !!source.getFlag(MODULE_NAME, this.#critKeenKey);

            let range = hasKeen
                ? originalCritRange * 2 - 21
                : originalCritRange;

            const value = FormulaCacheHelper.getModuleFlagValue(source, this.#critMultKey);

            range -= value;
            range = Math.clamp(range, 2, 20);
            return range;
        }

        const mult = getMult();
        const range = getRange();

        if (mult === originalCritMult
            && range === originalCritRange
        ) return;

        const rangeFormat = range === 20 ? '20' : `${range}-20`;
        const hint = `${rangeFormat}/x${mult}`;
        return [hint];
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {object} options
     * @param {boolean} [options.keen]
     * @param {Formula} [options.mult]
     * @param {Formula} [options.offset]
     * @returns {Promise<void>}
     */
    static async configure(item, { keen, mult, offset }) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.#critKeenKey]: !!keen,
                    [this.#critMultKey]: (mult || '') + '',
                    [this.#critOffsetKey]: (offset || '') + '',
                },
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
    static showInputOnItemSheet({ html, item, isEditable }) {
        showLabel({
            item,
            key: this.key,
            journal: this.journal,
            parent: html,
        }, {
            inputType: 'bonus',
        });
        checkboxInput({
            item,
            journal: this.journal,
            key: this.#critKeenKey,
            parent: html,
        }, {
            canEdit: isEditable,
            inputType: 'bonus',
            isSubLabel: true,
        });
        textInput({
            item,
            journal: this.journal,
            key: this.#critMultKey,
            parent: html,
        }, {
            canEdit: isEditable,
            inputType: 'bonus',
            isSubLabel: true,
        });
        textInput({
            item,
            journal: this.journal,
            key: this.#critOffsetKey,
            parent: html,
        }, {
            canEdit: isEditable,
            inputType: 'bonus',
            isSubLabel: true,
        });
    }
}
