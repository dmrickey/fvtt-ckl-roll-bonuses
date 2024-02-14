import { MODULE_NAME } from "../consts.mjs";
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
 * @param {string} keyStart
 * @returns {{[key: string]: (number | string)[]}}
 */
const getDocDFlagsStartsWith = (doc, keyStart) => {
    const /** @type {{[key: string]: (number | string)[]}} */ found = {};
    if (doc instanceof pf1.documents.actor.ActorPF) {
        Object.entries(doc.itemFlags.dictionary).forEach(([_itemTag, flags]) => {
            Object.entries(flags).forEach(([flag, value]) => {
                if (flag.startsWith(keyStart)) {
                    found[flag] ||= [];
                    found[flag].push(value);
                }
            });
        });

        return found;
    }
    if (doc instanceof pf1.documents.item.ItemPF) {
        Object.entries(doc.getItemDictionaryFlags()).forEach(([flag, value]) => {
            if (flag.startsWith(keyStart)) {
                found[flag] = [value];
            }
        });
        return found;
    }

    return {};
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
 * @param {ActorPF} actor
 * @param  {...string} flags
 * @returns True if the actor has the boolean flag or not.
 */
const hasAnyBFlag = (
    actor,
    ...flags
) => flags.some((flag) => !!actor?.itemFlags?.boolean?.[flag]);

export {
    countBFlags,
    getDocFlags,
    getDocDFlags,
    getDocDFlagsStartsWith,
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

    // todo - maybe after pf1 v10 after user is warned when there's a tag collision I can read the dFlags off of the passed in actor
    /**
     * @param {ItemDictionaryFlags | ActorPF | undefined | null} dFlags
     * @param {...string} flags
     */
    constructor(dFlags = {}, ...flags) {
        this.#flags = flags;

        if (dFlags instanceof pf1.documents.actor.ActorPF) {
            const actor = dFlags;
            actor.items.forEach(item => {
                if (item.isActive) {
                    let hasFlag = false;
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

                    if (hasFlag) {
                        this.#items[item.system.tag] = item;
                    }
                }
            });
        }
        else {
            for (const itemTag in (dFlags)) {
                flags.forEach((flag) => {
                    this.#byFlag[flag] ||= [];
                    if (dFlags[itemTag].hasOwnProperty(flag)) {
                        const value = dFlags[itemTag][flag];
                        this.#byFlag[flag].push(value);

                        this.#byItem[itemTag] ||= {};
                        this.#byItem[itemTag][flag] = value;
                    }
                });
            }
        }
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
     * @param {string} key
     * @param {string | number} value
     * @returns {ItemDictionaryFlags}
     */
    getItemDictionaryFlagsWithAllFlagsAndMatchingFlag(key, value) {
        const all = this.getItemDictionaryFlagsWithAllFlags();

        /** @type {ItemDictionaryFlags} */
        const result = {};
        Object.entries(all).forEach(([itemTag, dFlags]) => {
            if (dFlags[key] === value)
                result[itemTag] = dFlags;
        });
        return result;
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

    // /**
    //  * Returns an array of {@link FlagValue}s as {@link String}s.
    //  *
    //  * @returns {string[]}
    //  */
    // stringValuesForAllFlags() {
    //     return uniqueArray(
    //         Object.values(this.#byFlag)
    //             .flatMap((x) => x)
    //             .filter(truthiness)
    //             .map((x) => `${x}`)
    //     );
    // }

    /**
     * @returns {{[key: string]: number}}
     */
    #calculateSums() {
        /** @type {{[key: string]: number}} */
        const sums = {};

        Object.entries(this.#byItem).forEach(([tag, dFlags]) => {
            const item = this.#items[tag];
            Object.entries(dFlags).forEach(([flag, flagValue]) => {
                sums[flag] ||= 0;
                sums[flag] += RollPF.safeTotal(flagValue, item.getRollData());
            });
        })

        // todo verify this
        // Object.entries(this.#byFlag).forEach(([key, value]) => {
        //     sums[key] = value
        //         .map((x) => {
        //             const item = this.#items.find(i => i.id)
        //             return RollPF.safeTotal(x, rollData);
        //         })
        //         .reduce((acc, current) => acc + current, 0);
        // });
        return sums;
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
     * @param {string} flag - The flag to fetch the total for
     * @returns {number} - The total for the given flag
     */
    sumOfFlag(flag) {
        return this.sumEntries()[flag];
    }

    /**
     * Gets the sum of all values.
     * @returns {number} - The combined total for all flags
     */
    sumAll() {
        return Object.values(this.sumEntries()).reduce((sum, current) => sum + current, 0);
    }
}
