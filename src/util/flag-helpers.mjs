import { MODULE_NAME } from "../consts.mjs";
import { api } from './api.mjs';
import { difference } from './array-intersects.mjs';
import { ifDebug } from './if-debug.mjs';
import { signed } from './to-signed-string.mjs';
import { truthiness } from "./truthiness.mjs";

/**
 * Get the matching module flag from the given document
 *
 * @param {BaseDocument | undefined | null} doc - Item or Actor
 * @param {string} key
 * @returns {any[]}
 */
export const getDocFlags = (doc, key) => {
    // if doc is an actor
    if (doc instanceof pf1.documents.actor.ActorPF) {
        const flags = doc.items
            .filter((item) => item.isActive)
            .map(i => i.getFlag(MODULE_NAME, key))
            .filter(truthiness);
        return flags;
    }

    // else read the flag off the item
    if (doc instanceof pf1.documents.item.ItemPF && doc.isActive) {
        return [doc.getFlag(MODULE_NAME, key)].filter(truthiness);
    }

    return [];
}

api.utils.getDocFlags = getDocFlags;

export class FormulaCacheHelper {

    static {
        api.utils.FormulaCacheHelper = FormulaCacheHelper;
    }

    /** @type {string[]} */
    static #moduleFlags = [];

    /**
     * Registers foundry module flag to cache helper
     *
     * @param  {...string} moduleFlags
     */
    static registerModuleFlag(...moduleFlags) {
        this.#moduleFlags.push(...moduleFlags);
    }

    /**
     * @param {ItemPF} item
     * @param {RollData} rollData
     */
    static cacheFormulas(item, rollData) {
        if (!item) return;

        /**
         * @param {string} formula
         * @param {string} flag
         */
        const cacheFormula = (formula, flag) => {
            if (formula) {
                try {
                    const roll = RollPF.create(formula + '', rollData);
                    item[MODULE_NAME][flag] = roll.formula;
                }
                catch {
                    console.error('Problem with formula', formula, flag, item);
                    item[MODULE_NAME][flag] = '0';
                }
            }
        }

        this.#moduleFlags.forEach((flag) => {
            const exactFormula = item.flags?.[MODULE_NAME]?.[flag];
            cacheFormula(exactFormula, flag);
        });
    }

    /**
     * Builds item hint for given key
     * @param {ItemPF} item
     * @param {string} key
     * @param {(total: string | number) => string} format
     * @returns {string | undefined}
     */
    static getHint(item, key, format) {
        const formula = this.getModuleFlagFormula(item, key)[key];
        if (formula === '') return;

        const roll = RollPF.create(formula + '');
        if (roll.isDeterministic) {
            const total = roll.evaluateSync({ forceSync: true }).total;
            const mod = signed(total);
            return format(mod);
        }
        return format(formula);
    }

    /**
     * Combines multiple flags into a single sum
     * @param {ItemPF} item
     * @param {...string} keys
     * @returns {number}
     */
    static getModuleFlagValue(item, ...keys) {
        const formulas = Object.values(this.getModuleFlagFormula(item, ...keys));
        const total = formulas.reduce((/** @type {number} */ sum, formula) => sum + RollPF.safeTotal(formula), 0);
        return total;
    }

    /**
     * @param {ItemPF} item
     * @param {...string} keys
     * @returns {Record<string, number | string>}}
     */
    static getModuleFlagFormula(item, ...keys) {
        ifDebug(() => {
            const diff = difference(keys, this.#moduleFlags);
            if (diff.length) console.error(`Module flag(s) has not been cached:`, diff);
        });

        const formulas = keys.reduce((obj, key) => ({ ...obj, [key]: item?.[MODULE_NAME]?.[key] || '' }), {});
        return formulas;
    }
}
