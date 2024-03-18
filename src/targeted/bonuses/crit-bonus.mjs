import { MODULE_NAME } from '../../consts.mjs';
import { checkboxInput } from '../../handlebars-handlers/bonus-inputs/chekbox-input.mjs';
import { textInput } from "../../handlebars-handlers/bonus-inputs/text-input.mjs";
import { FormulaCacheHelper } from "../../util/flag-helpers.mjs";
import { BaseBonus } from "./base-bonus.mjs";

// TODO actually add overrides

/**
 * @extends BaseBonus
 */
export class CritBonus extends BaseBonus {
    /**
     * @inheritdoc
     * @override
     */
    static get type() { return 'crit'; }

    static get #critKeenKey() { return `${this.key}-keen`; }
    static get #critMultKey() { return `${this.key}-mult`; }
    static get #critOffsetKey() { return `${this.key}-offset`; }

    /**
     * @override
     */
    static init() {
        FormulaCacheHelper.registerModuleFlag(this.#critMultKey, this.#critOffsetKey);
    }

    /**
     * Register Item Hint on bonus
     *
     * @override
     * @param {ItemPF} source
     * @param {ItemPF} item
     * @returns {Nullable<string[]>}
     */
    static getHints(source, item) {
        const action = item.firstAction;
        if (!item.firstAction) return;

        const isBroken = !!item.system.broken;

        if (!(action?.hasAttack && action.data.ability?.critMult > 1)) return;

        const getMult = () => {
            if (isBroken) return 2;

            const mult = +(action.data.ability.critMult || 2) + FormulaCacheHelper.getModuleFlagValue(source, this.#critMultKey);
            return mult;
        }

        const getRange = () => {
            if (isBroken) return 20;

            const current = action.data.ability.critRange;

            const hasKeen = !!item.getFlag(MODULE_NAME, this.#critKeenKey);

            let range = hasKeen
                ? current * 2 - 21
                : current;

            const value = FormulaCacheHelper.getModuleFlagValue(source, this.#critMultKey);

            range -= value;
            range = Math.clamped(range, 2, 20);
            return range;
        }

        const mult = getMult();
        const range = getRange();

        if (mult === action.data.ability.critMult
            && range === action.data.ability.critRange
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
        const hasFlag = item.hasItemBooleanFlag(this.key);
        if (!hasFlag) {
            return;
        }

        checkboxInput({
            item,
            key: this.#critKeenKey,
            parent: html,
            label: 'TODO - crit keen',
        }, {
            isModuleFlag: true,
        });
        textInput({
            item,
            key: this.#critMultKey,
            parent: html,
            label: 'TODO - crit mult',
        }, {
            isModuleFlag: true,
        });
        textInput({
            item,
            key: this.#critOffsetKey,
            parent: html,
            label: 'TODO - crit offset',
        }, {
            isModuleFlag: true,
        });
    }
}
