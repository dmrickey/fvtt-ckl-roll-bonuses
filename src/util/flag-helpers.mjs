import { MODULE_NAME } from "../consts.mjs";
import { api } from './api.mjs';
import { difference, intersection } from './array-intersects.mjs';
import { ifDebug } from './if-debug.mjs';
import { truthiness } from "./truthiness.mjs";

/**
 * Get the matching dictionary flag from the given document
 *
 * @param {BaseDocument | undefined | null} doc - Item or Actor
 * @param {string} key
 * @param {object} [options]
 * @param {boolean} [options.includeInactive]
 * @returns {FlagValue[]}
 */
const getDocDFlags = (doc, key, { includeInactive = true } = {}) => {
    // if doc is an actor
    if (doc instanceof pf1.documents.actor.ActorPF) {
        const flags = doc.items
            .filter((i) => i.isActive || includeInactive)
            .map(i => i.getItemDictionaryFlag(key))
            .filter(truthiness);
        return flags;
    }

    // else read the flag off the item
    if (doc instanceof pf1.documents.item.ItemPF) {
        return [(doc.isActive || includeInactive) && doc.getItemDictionaryFlag(key)]
            .filter(truthiness);
    }

    return [];
}

/**
 * Get the matching module flag from the given document
 *
 * @param {BaseDocument | undefined | null} doc - Item or Actor
 * @param {string} key
 * @param {object} [options]
 * @param {boolean} [options.includeInactive]
 * @returns {any[]}
 */
const getDocFlags = (doc, key, { includeInactive = false } = {}) => {
    // if doc is an actor
    if (doc instanceof pf1.documents.actor.ActorPF) {
        const flags = doc.items
            .filter((item) => item.isActive || includeInactive)
            .map(i => i.getFlag(MODULE_NAME, key))
            .filter(truthiness);
        return flags;
    }

    // else read the flag off the item
    if (doc instanceof pf1.documents.item.ItemPF && (doc.isActive || includeInactive)) {
        return [doc.getFlag(MODULE_NAME, key)].filter(truthiness);
    }

    return [];
}

/**
 * Return any dictionary flags on the document that start with the given partial string
 *
 * @param {BaseDocument} doc
 * @param {...string} keyStarts
 * @returns {string[]}
 */
const getDocBFlagsStartsWith = (doc, ...keyStarts) => {
    /** @type {string[]} */
    const found = [];

    if (doc instanceof pf1.documents.actor.ActorPF) {
        Object.entries(doc.itemFlags?.boolean ?? {}).forEach(([_itemTag, flags]) => {
            Object.entries(flags).forEach(([flag]) => {
                keyStarts.forEach((keyStart) => {
                    if (flag.startsWith(keyStart)) {
                        found.push(flag);
                    }
                });
            });
        });
    }
    else if (doc instanceof pf1.documents.item.ItemPF) {
        Object.entries(doc.getItemDictionaryFlags()).forEach(([flag, value]) => {
            keyStarts.forEach((keyStart) => {
                if (flag.startsWith(keyStart)) {
                    found.push(flag);
                }
            });
        });
    }

    return found;
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

/**
 * @param {ItemPF} item
 * @param {string} flag
 * @returns {boolean} True if the item has the dictionary flag.
 */
const hasDFlag = (item, flag) => item.system.flags.dictionary?.hasOwnProperty(flag);

export {
    countBFlags,
    getDocBFlagsStartsWith,
    getDocDFlags,
    getDocDFlagsStartsWith,
    getDocFlags,
    hasAnyBFlag,
    hasDFlag,
}

api.utils.countBFlags = countBFlags;
api.utils.getDocBFlagsStartsWith = getDocBFlagsStartsWith;
api.utils.getDocDFlags = getDocDFlags;
api.utils.getDocDFlagsStartsWith = getDocDFlagsStartsWith;
api.utils.getDocFlags = getDocFlags;
api.utils.hasAnyBFlag = hasAnyBFlag;
api.utils.hasDFlag = hasDFlag;

/**
 * @deprecated
 */
export class KeyedDFlagHelper {

    static {
        api.utils.KeyedDFlagHelper = KeyedDFlagHelper;
    }

    /** @type {{[key: string]: FlagValue[]}} */
    #byFlag = {};

    /** @type {{[key: string]: number}?} - Sums for each individual flag */
    #sumByFlag = null;

    /** @type {ItemDictionaryFlags} - Keyed by item tag, and contains at least one flag/value */
    #byItem = {};

    /** @type {string[]} - The flags*/
    #flags = [];

    /** @type {{[key: FlagValue]: string[]}} Keyed by flag value, list of flags containing  */
    #byValue = {};

    /** @type {{[key: string]: ItemPF}} */
    #items = {};

    /**
     * @param {ActorPF} actor
     * @param {object} options
     * @param {boolean} [options.includeInactive]
     * @param {boolean} [options.onlyIncludeAllFlags]
     * @param {{[key: string]: FlagValue | ((arg: FlagValue) => boolean)}} [options.mustHave]
     * @param {...string} flags
     */
    constructor(actor, { includeInactive = false, onlyIncludeAllFlags = false, mustHave = {} }, ...flags) {
        this.#flags = flags;

        actor.items.forEach(item => {
            if (includeInactive || item.isActive) {
                let hasFlag = false;
                if ((!onlyIncludeAllFlags || intersection(this.#flags, Object.keys(item.system.flags.dictionary)).length === this.#flags.length)
                    && Object.entries(mustHave).every(([key, value]) =>
                        typeof value === 'function'
                            ? value(item.system.flags.dictionary[key])
                            : item.system.flags.dictionary[key] === value
                    )
                ) {
                    flags.forEach((flag) => {
                        this.#byFlag[flag] ||= [];
                        if (item.system.flags.dictionary[flag]) {
                            const value = item.system.flags.dictionary[flag];
                            this.#byFlag[flag].push(value);

                            this.#byItem[item.system.tag] ||= {};
                            this.#byItem[item.system.tag][flag] = value;

                            this.#byValue[value] ||= [];
                            this.#byValue[value].push(flag);
                            hasFlag = true;
                        }
                    });
                }

                if (hasFlag) {
                    this.#items[item.system.tag] = item;
                }
            }
        });
    }

    /**
     * @returns {boolean} - whether or not any flags were found
     */
    hasAnyFlags() {
        return !!Object.values(this.#byFlag).find(x => x.length);
    }

    /**
     * @param {string} flag
     * @returns {ItemPF[]}
     */
    itemsForFlag(flag) {
        return Object.values(this.#items)
            .filter((item) => hasDFlag(item, flag));
    }

    /**
     * @param {string} flag
     * @returns {FlagValue[]}
     */
    valuesForFlag(flag) {
        return this.#byFlag[flag]?.filter(truthiness) ?? [];
    }

    /**
     * Returns an array of {@link FlagValue}s as {@link String}s.
     *
     * @param {string} flag
     * @returns {string[]}
     */
    stringValuesForFlag(flag) {
        return this.valuesForFlag(flag).map((x) => `${x}`);
    }

    /**
     *
     * @param {FlagValue} value
     * @returns {string[]}
     */
    keysForValue(value) {
        return this.#byValue[value] ?? [];
    }

    /**
     * @returns {{[key: string]: number}}
     */
    #calculateSums() {
        if (this.#sumByFlag) return this.#sumByFlag;

        this.#sumByFlag = {};

        Object.entries(this.#byItem).forEach(([tag, dFlags]) => {
            const item = this.#items[tag];
            Object.keys(dFlags).forEach((flag) => {
                if (FormulaCacheHelper.isUncacheableDictionaryFlag(flag)) {
                    return;
                }

                // @ts-ignore
                this.#sumByFlag[flag] ||= 0;

                var total = flag.includes('_')
                    ? FormulaCacheHelper.getExactPartialDictionaryFlagValue(item, flag)
                    : FormulaCacheHelper.getDictionaryFlagValue(item, flag);
                // @ts-ignore
                this.#sumByFlag[flag] += total;
            });
        })

        return this.#sumByFlag;
    }

    /**
     * Gets the keyed sums for each flag
     * @returns {{[key: string]: number}} Totals, keyed by flag
     */
    sumEntries() {
        this.#sumByFlag ??= this.#calculateSums();
        return { ...this.#sumByFlag };
    }

    /**
     * Gets the sum of all values for the given flag.
     * @param {...string} flags - The flags to fetch the totals for
     * @returns {number} - The total for the given flags
     */
    sumOfFlags(...flags) {
        return flags.reduce((sum, flag) => sum + (this.sumEntries()[flag] || 0), 0);
    }

    /**
     * Gets the sum of all values.
     * @returns {number} - The combined total for all flags
     */
    sumAll() {
        return Object.values(this.sumEntries()).reduce((sum, current) => sum + current, 0);
    }
}

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
    /** @type {Set<string>} */
    static #uncacheableDictionaryFlags = new Set();

    /**
     * Registers flags that can't be cached. This is used to suppress error messages when doing lookups for key pairs associated with a type and a formula.
     * This is for when using KeydDFlagHelper sums that it will skip trying to tally flags that are types.
     *
     * @param  {...string} flags
     */
    static registerUncacheableDictionaryFlag(...flags) {
        flags.forEach((f) => this.#uncacheableDictionaryFlags.add(f));
    }
    static isUncacheableDictionaryFlag(/** @type {string} */flag) {
        return this.#uncacheableDictionaryFlags.has(flag);
    }

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
        keys = difference(keys, this.#uncacheableDictionaryFlags);
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
