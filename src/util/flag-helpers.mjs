import { MODULE_NAME } from "../consts.mjs";
import { api } from './api.mjs';
import { difference } from './array-intersects.mjs';
import { ifDebug } from './if-debug.mjs';
import { truthiness } from "./truthiness.mjs";

/**
 * Get the matching module flag from the given document
 *
 * @param {BaseDocument | undefined | null} doc - Item or Actor
 * @param {string} key
 * @returns {any[]}
 */
const getDocFlags = (doc, key) => {
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

/**
 * Return any dictionary flags on the document that start with the given partial string
 *
 * nothing should really be using dFlags any more. This is just here because the Critical helper needs it and I'm too lazy to refactor it
 *
 * @deprecated
 * @param {BaseDocument} doc
 * @param {...string} keyStarts
 * @returns {{[key: string]: (number | string)[]}}
 */
const getDocDFlagsStartsWith = (doc, ...keyStarts) => {
    /** @type {{[key: string]: (number | string)[]}} */
    const found = {};

    if (doc instanceof pf1.documents.actor.ActorPF) {
        Object.entries(doc.itemFlags?.dictionary ?? {}).forEach(([_itemTag, flags]) => {
            Object.entries(flags).forEach(([flag, value]) => {
                keyStarts.forEach((keyStart) => {
                    if (flag.startsWith(keyStart)) {
                        found[flag] ||= [];
                        found[flag].push(value);
                    }
                });
            });
        });
    }
    else if (doc instanceof pf1.documents.item.ItemPF) {
        Object.entries(doc.getItemDictionaryFlags()).forEach(([flag, value]) => {
            keyStarts.forEach((keyStart) => {
                if (flag.startsWith(keyStart)) {
                    found[flag] = [value];
                }
            });
        });
    }

    return found;
}

/**
 * Counts the amount of items that have a given boolean flags
 * @param {EmbeddedCollection<ItemPF>} items
 * @param {string[]} flags
 * @returns {{[key: string]: number}} - the count of items that have the given boolean flags
 */
const countBFlags = (items, ...flags) => {
    const count = Object.fromEntries(flags.map((flag) => [flag, 0]));

    (items || []).forEach((/** @type {ItemPF} */item) => {
        if (!item.isActive) return;

        flags.forEach((flag) => {
            if (item.hasItemBooleanFlag(flag)) {
                count[flag]++;
            }
        });
    });

    return count;
}

/**
 * Whether or not the document has any of the given boolean flags
 *
 * @param {Nullable<ActorBasePF | ItemPF>} doc
 * @param  {...string} flags
 * @returns {boolean} True if the actor has any of the boolean flags.
 */
const hasAnyBFlag = (
    doc,
    ...flags
) => {
    if (!doc) return false;

    if (doc instanceof pf1.documents.actor.ActorBasePF) {
        return flags.some((flag) => !!doc?.itemFlags?.boolean?.[flag]);
    }
    if (doc instanceof pf1.documents.item.ItemPF) {
        return flags.some((flag) => doc.hasItemBooleanFlag(flag));
    }

    return false;
}

/**
 * Whether or not the document has all of the given boolean flags
 *
 * @param {Nullable<ActorBasePF | ItemPF>} doc
 * @param  {...string} flags
 * @returns {boolean} True if the actor has any of the boolean flags.
 */
const hasAllBFlag = (
    doc,
    ...flags
) => {
    if (!doc) return false;

    if (doc instanceof pf1.documents.actor.ActorBasePF) {
        return flags.every((flag) => !!doc?.itemFlags?.boolean?.[flag]);
    }
    if (doc instanceof pf1.documents.item.ItemPF) {
        return flags.every((flag) => doc.hasItemBooleanFlag(flag));
    }

    return false;
}

export {
    countBFlags,
    getDocDFlagsStartsWith,
    getDocFlags,
    hasAnyBFlag,
}

api.utils.countBFlags = countBFlags;
api.utils.getDocDFlagsStartsWith = getDocDFlagsStartsWith;
api.utils.getDocFlags = getDocFlags;
api.utils.hasAnyBFlag = hasAnyBFlag;

export class FormulaCacheHelper {

    static {
        api.utils.FormulaCacheHelper = FormulaCacheHelper;
    }

    /** @type {string[]} */
    static #dictionaryFlags = [];
    /** @type {string[]} */
    static #partialDictionaryFlags = [];
    /** @type {string[]} */
    static #moduleFlags = [];

    /**
     * Registers dicationary flag to cache helper
     *
     * @param  {...string} flags
     */
    static registerDictionaryFlag(...flags) {
        const invalid = flags.filter((f) => f.includes('_'));
        if (invalid.length) console.error(`Dictionary flag(s) cannot have an underscore:`, invalid);

        this.#dictionaryFlags.push(...flags);
    }

    /**
     * Registers partial dicationary flag to cache helper, i.e. flagsa that start with the given value - used for flags that include an id in the string
     *
     * @param  {...string} partialFlags
     */
    static registerPartialDictionaryFlag(...partialFlags) {
        const invalid = partialFlags.filter((f) => f.slice(-1) !== '_');
        if (invalid.length) console.error(`Partial dictionary flag(s) must have an underscore:`, invalid);

        this.#partialDictionaryFlags.push(...partialFlags);
    }

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
         *
         * @param {FlagValue} exactFormula
         * @param {string} flag
         */
        const cacheFormula = (exactFormula, flag) => {
            if (exactFormula) {
                const roll = RollPF.safeRollSync(exactFormula, rollData);
                item[MODULE_NAME][flag] = roll.simplifiedFormula;
            }
        }

        this.#dictionaryFlags.forEach((flag) => {
            const exactFormula = item.getItemDictionaryFlag(flag);
            cacheFormula(exactFormula, flag);
        });

        const flagValues = getDocDFlagsStartsWith(item, ...this.#partialDictionaryFlags);
        // because this is an item and not an actor there can only be one value in the flag's array
        Object.entries(flagValues).forEach(([flag, [exactFormula]]) =>
            cacheFormula(exactFormula, flag)
        );

        this.#moduleFlags.forEach((flag) => {
            const exactFormula = item.flags?.[MODULE_NAME]?.[flag];
            cacheFormula(exactFormula, flag);
        });
    }

    /**
     * @param {ItemPF} item
     * @param {...string} keys
     * @returns {number}
     */
    static getDictionaryFlagValue(item, ...keys) {
        const formulas = Object.values(this.getDictionaryFlagFormula(item, ...keys));
        const total = formulas.reduce((/** @type {number} */ sum, formula) => sum + RollPF.safeTotal(formula), 0);
        return total;
    }

    /**
     * Get value for registered partial key (e.g. keen_)
     * Combines multiple flags into a single sum
     *
     * @param {ItemPF} item
     * @param {...string} keys
     * @returns {number}
     */
    static getPartialDictionaryFlagValue(item, ...keys) {
        const formulas = Object.values(this.getPartialDictionaryFlagFormula(item, ...keys));
        const total = formulas.reduce((/** @type {number} */ sum, formula) => sum + RollPF.safeTotal(formula), 0);
        return total;
    }

    /**
     * Get formula for registered partial key but have id (e.g. keen_12345678)
     * Combines multiple flags into a single sum
     *
     * @param {ItemPF} item
     * @param {...string} keys
     * @returns {number}
     */
    static getExactPartialDictionaryFlagValue(item, ...keys) {
        const formulas = Object.values(this.getExactPartialDictionaryFlagFormula(item, ...keys));
        const total = formulas.reduce((/** @type {number} */ sum, formula) => sum + RollPF.safeTotal(formula), 0);
        return total;
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
     * Combines multiple flags into a single sum
     * @param {ItemPF} item
     * @param {...string} keys
     * @returns {Record<string, number | string>}}
     */
    static getDictionaryFlagFormula(item, ...keys) {
        ifDebug(() => {
            const diff = difference(keys, this.#dictionaryFlags);
            if (diff.length) console.error(`Dictionary flag(s) has not been cached:`, diff);
        });

        const formulas = keys.reduce((obj, key) => ({ ...obj, [key]: item?.[MODULE_NAME]?.[key] || '' }), {});
        return formulas;
    }

    /**
     * Get formulas for flags that start with this partial key (e.g. keen_)
     *
     * @param {ItemPF} item
     * @param {...string} keys
     * @returns {Record<string, number | string>}}
     */
    static getPartialDictionaryFlagFormula(item, ...keys) {
        ifDebug(() => {
            const diff = difference(keys, this.#partialDictionaryFlags);
            if (diff.length) console.error(`Partial dictionary flag(s) has not been cached:`, diff);
        });

        const flagValues = getDocDFlagsStartsWith(item, ...keys);
        const flags = Object.keys(flagValues);
        const formulas = flags.reduce((obj, flag) => ({ ...obj, [flag]: item?.[MODULE_NAME]?.[flag] || '' }), {});
        return formulas;
    }

    /**
     * Get formulas for flags that start with this partial key but have id (e.g. keen_12345678)
     *
     * @param {ItemPF} item
     * @param {...string} keys
     * @returns {Record<string, number | string>}}
     */
    static getExactPartialDictionaryFlagFormula(item, ...keys) {
        ifDebug(() => {
            const partialKeys = keys.map(x => x.split('_')[0] + '_');
            const diff = difference(partialKeys, this.#partialDictionaryFlags);
            if (diff.length) console.error(`Partial dictionary flag(s) has not been cached:`, diff);
        });

        const flagValues = getDocDFlagsStartsWith(item, ...keys);
        const flags = Object.keys(flagValues);
        const formulas = flags.reduce((obj, flag) => ({ ...obj, [flag]: item?.[MODULE_NAME]?.[flag] || '' }), {});
        return formulas;
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
