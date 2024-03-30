import { hasLegacyCritFlag } from '../../bonuses/critical.mjs';
import { MODULE_NAME } from '../../consts.mjs';
import { checkboxInput } from '../../handlebars-handlers/bonus-inputs/chekbox-input.mjs';
import { textInput } from "../../handlebars-handlers/bonus-inputs/text-input.mjs";
import { handleBonusTypeFor } from '../../target-and-bonus-join.mjs';
import { FormulaCacheHelper } from "../../util/flag-helpers.mjs";
import { LocalHookHandler, localHooks } from '../../util/hooks.mjs';
import { localize } from '../../util/localize.mjs';
import { SelfTarget } from '../targets/self-target.mjs';
import { BaseBonus } from "./base-bonus.mjs";

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
     * If the item is providing this bonus
     * @override
     * @param {ItemPF} source
     * @returns {boolean}
     */
    static isSource(source) { return super.isSource(source) && !hasLegacyCritFlag(source); };

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

            handleBonusTypeFor(
                action,
                CritBonus,
                (bonusType, sourceItem) => {
                    hasKeen ||= bonusType.hasKeen(sourceItem);
                    offset += bonusType.getOffsetValue(sourceItem);
                }
            );

            if (!offset && !hasKeen) {
                return current;
            }

            let range = hasKeen
                ? current * 2 - 21
                : current;

            range -= offset;
            range = Math.clamped(range, 2, 20);
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

            handleBonusTypeFor(
                action,
                CritBonus,
                (bonusType, sourceItem) => {
                    hasKeen ||= bonusType.hasKeen(sourceItem);
                    offset += bonusType.getOffsetValue(sourceItem);
                    mult += bonusType.getMultValue(sourceItem);
                }
            );

            rollData.action.ability.critMult = isBroken ? 2 : mult;

            const current = rollData.action.ability.critRange || 20;
            let range = hasKeen
                ? current * 2 - 21
                : current;
            range -= offset;
            range = Math.clamped(range, 2, 20);
            rollData.action.ability.critRange = isBroken ? 20 : range;

        };
        LocalHookHandler.registerHandler(localHooks.updateItemActionRollData, updateItemActionRollData);
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
            target = source.firstAction;
        }

        /** @type {Nullable<ItemAction>} */
        let itemAction;
        if (target) {
            itemAction = target instanceof pf1.documents.item.ItemPF
                ? target.firstAction
                : target instanceof pf1.components.ItemAction
                    ? target
                    : undefined;
        }

        /** @type {number} */ let originalCritMult;
        /** @type {number} */ let originalCritRange;
        /** @type {boolean} */ let isBroken;
        if (itemAction && itemAction.data.ability?.critMult > 1) {
            originalCritMult = +(itemAction.data.ability?.critMult) || 2;
            originalCritRange = itemAction.data.ability?.critRange || 20;
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
            range = Math.clamped(range, 2, 20);
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
     * @override
     * @param {object} options
     * @param {ActorPF | null} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ item, html }) {
        checkboxInput({
            item,
            journal: this.journal,
            key: this.#critKeenKey,
            parent: html,
        }, {
            isModuleFlag: true,
        });
        textInput({
            item,
            journal: this.journal,
            key: this.#critMultKey,
            parent: html,
        }, {
            isModuleFlag: true,
        });
        textInput({
            item,
            journal: this.journal,
            key: this.#critOffsetKey,
            parent: html,
        }, {
            isModuleFlag: true,
        });
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @param {(ActionUse | ItemPF | ItemAction)?} item
     * @returns {string[]}
     */
    static getFootnotes(source, item) {
        return this.getHints(source, item) || [];
    }
}
