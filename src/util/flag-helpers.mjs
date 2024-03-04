import { MODULE_NAME } from "../consts.mjs";
import { intersection } from './array-intersects.mjs';
import { truthiness } from "./truthiness.mjs";
import { uniqueArray } from "./unique-array.mjs";

// todo update to use actor.itemFlags.dictionary or item.system.flags.dictionary
//   can't really do this an support the same feat with different bonuses
/**
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
 * Get Document flags
 *
 * @param {BaseDocument | undefined | null} doc - Item or Actor
 * @param {string} key
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
 * @param {BaseDocument} doc
 * @param {...string} keyStarts
 * @returns {{[key: string]: (number | string)[]}}
 */
const getDocDFlagsStartsWith = (doc, ...keyStarts) => {
    /** @type {{[key: string]: (number | string)[]}} */
    const found = {};

    if (doc instanceof pf1.documents.actor.ActorPF) {
        Object.entries(doc.itemFlags.dictionary).forEach(([_itemTag, flags]) => {
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

// todo swap like individual method
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
 *
 * @param {Nullable<ActorPF>} actor
 * @param  {...string} flags
 * @returns True if the actor has the boolean flag or not.
 */
const hasAnyBFlag = (
    actor,
    ...flags
) => !!actor && flags.some((flag) => !!actor?.itemFlags?.boolean?.[flag]);

export {
    countBFlags,
    getDocDFlags,
    getDocDFlagsStartsWith,
    getDocFlags,
    hasAnyBFlag,
}

export class KeyedDFlagHelper {
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

    /** @type {ActorPF} */
    #actor;

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
        this.#actor = actor;

        actor.items.forEach(item => {
            if (includeInactive || item.isActive) {
                let hasFlag = false;
                if ((!onlyIncludeAllFlags || intersection(this.#flags, Object.keys(item.system.flags.dictionary)).length === this.#flags.length)
                    && Object.entries(mustHave).every(([key, value]) => {
                        return (typeof value === 'function')
                            ? value(item.system.flags.dictionary[key])
                            : item.system.flags.dictionary[key] === value;
                    })
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
     * @returns {DictionaryFlags[]}
     */
    get dictionaryFlagsFromItems() {
        return Object.values(this.#byItem);
    }

    /**
     * @returns {ItemPF[]}
     */
    get flaggedItems() {
        return Object.values(this.#items);
    }

    /**
     * If the helper was created with 3 flags, then return {@see ItemDictionaryFlags} for only those items that have all three flags
     * @deprecated Use `onlyIncludeAllFlags` in constructor instead
     * @returns {ItemDictionaryFlags}
     */
    getItemDictionaryFlagsWithAllFlags() {
        /** @type {ItemDictionaryFlags} */
        const result = {};
        Object.entries(this.#byItem).forEach(([key, value]) => {
            if (Object.keys(value).length === this.#flags.length) {
                result[key] = value;
            }
        });
        return result;
    }

    /**
     * @returns {ItemDictionaryFlags}
     */
    getItemDictionaryFlags() {
        return { ...this.#byItem };
    }

    /**
     *
     * @returns {boolean} - whether or not any flags were found
     */
    hasAnyFlags() {
        return !!Object.values(this.#byFlag).find(x => x.length);
    }

    /**
     *
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
            Object.entries(dFlags).forEach(([flag, _flagValue]) => {
                // @ts-ignore
                this.#sumByFlag[flag] ||= 0;

                var total = FormulaCacheHelper.getDictionaryFlagValue(item, flag);
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
        this.#dictionaryFlags.push(...flags);
    }

    /**
     * Registers partial dicationary flag to cache helper, i.e. flagsa that start with the given value - used for flags that include an id in the string
     *
     * @param  {...string} partialFlags
     */
    static registerPartialDictionaryFlag(...partialFlags) {
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

        this.#dictionaryFlags.forEach((flag) => {
            const formula = item.getItemDictionaryFlag(flag);
            if (formula) {
                const value = RollPF.safeTotal(formula, rollData);

                item[MODULE_NAME][flag] = value;
            }
        });

        const flagValues = getDocDFlagsStartsWith(item, ...this.#partialDictionaryFlags);
        const flags = Object.keys(flagValues);
        flags.forEach((flag) => {
            // because this is an item and not an actor there can only be one value in the array
            const exactFormula = flagValues[flag][0];
            const formula = RollPF.safeRoll(exactFormula, rollData).formula;

            item[MODULE_NAME][flag] = formula;
        });

        this.#moduleFlags.forEach((flag) => {
            const formula = item.flags?.[MODULE_NAME]?.[flag];
            if (formula) {
                const value = RollPF.safeTotal(formula, rollData);

                item[MODULE_NAME][flag] = value;
            }
        });
    }

    /**
     * @param {ItemPF} item
     * @param {...string} keys
     * @returns {number}
     */
    static getDictionaryFlagValue(item, ...keys) {
        const total = keys.reduce((sum, key) => {
            const formula = item?.[MODULE_NAME]?.[key] || 0;
            const total = RollPF.safeTotal(formula);
            return sum + total;
        }, 0);
        return total;
    }

    /**
     * @param {ItemPF} item
     * @param {...string} keys
     * @returns {number}
     */
    static getPartialDictionaryFlagValue(item, ...keys) {
        const flagValues = getDocDFlagsStartsWith(item, ...keys);
        const flags = Object.keys(flagValues);
        const total = flags.reduce((sum, key) => {
            const formula = item?.[MODULE_NAME]?.[key] || 0;
            const total = RollPF.safeTotal(formula);
            return sum + total;
        }, 0);
        return total;
    }

    /**
     * @param {ItemPF} item
     * @param {...string} keys
     * @returns {number}
     */
    static getModuleFlagValue(item, ...keys) {
        const total = keys.reduce((sum, key) => {
            const formula = item?.[MODULE_NAME]?.[key] || 0;
            const total = RollPF.safeTotal(formula);
            return sum + total;
        }, 0);
        return total;
    }
}
