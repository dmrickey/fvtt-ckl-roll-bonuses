import { truthiness } from "./truthiness.mjs";

// todo update to use actor.itemFlags.dictionary or item.system.flags.dictionary
/**
 *
 * @param {BaseDocument} doc - Item or Actor
 * @param {string} key
 * @returns
 */
const getDocDFlags = (doc, key) => {
    // if doc is an actor
    if (doc instanceof pf1.documents.actor.ActorPF) {
        const flags = doc.items
            .map(i => i.isActive && i.getItemDictionaryFlag(key))
            .filter(truthiness);
        return flags;
    }

    // else read the flag off the item
    if (doc instanceof pf1.documents.item.ItemPF) {
        return [doc.getItemDictionaryFlag(key)].filter(truthiness);
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

/**
 * @param {ItemDictionaryFlags} dFlags
 * @param {...string} flags
 * @returns {{[key: string]: (number | string)[]}} - { foundKey1: [values from different items], foundKey2: [...], ...}
 */
const getFlagsFromDFlags = (dFlags, ...flags) => {
    const /** @type {{[key: string]: (number | string)[]}} */ found = {};
    for (const item in (dFlags || {})) {
        flags.forEach((flag) => {
            if (dFlags[item].hasOwnProperty(flag)) {
                found[flag] ||= [];
                found[flag].push(dFlags[item][flag]);
            }
        });
    }
    return found;
}

// item.system.flags.boolean - note to self for later
// todo swap this to actor.itemFlags.boolean[flag].sources.length
/**
 * Counts the amount of active items that have a given boolean flag
 * @param {ItemPF[]} items
 * @param {string} flag
 * @returns {number} - the count of items that have the given bFlag
 */
const countBFlag = (items, flag) => (items || []).filter((item) => item.isActive && item.hasItemBooleanFlag(flag)).length;

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
    countBFlag,
    countBFlags,
    getDocDFlags,
    getDocDFlagsStartsWith,
    getFlagsFromDFlags,
    hasAnyBFlag,
}

export class KeyedDFlagHelper {
    /** @type {{[key: string]: FlagValue[]}} */
    #byFlag = {};

    /** @type {{[key: string]: number}?} - Sums for each individual flag */
    #sumByFlag = null;

    /** @type {ItemDictionaryFlags} - Keyed by item tag, and contains each flag/value */
    #byItem = {};

    /** @type {string[]} - The flags*/
    #flags = [];

    // * @returns {Object} - { foundKey1: [values from different items], foundKey2: [...], ...}
    /**
     * @param {ItemDictionaryFlags | undefined} dFlags
     * @param {...string} flags
    */
    constructor(dFlags = {}, ...flags) {
        this.#flags = flags;
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

    /**
     *
     * @returns {ItemDictionaryFlags}
    */
    getDFlagsWithAllFlagsByItem() {
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
     * @param {RollData} rollData
     * @returns {{[key: string]: number}}
    */
    // @ts-ignore
    #calculateSums(rollData) {
        /** @type {{[key: string]: number}} */
        const sums = {};
        Object.entries(this.#byFlag).forEach(([key, value]) => {
            sums[key] = value
                .map((x) => RollPF.safeTotal(x, rollData))
                .reduce((acc, current) => acc + current, 0);
        });
        return sums;
    }
    /**
     * Gets the keyed sums for each flag
     * @param {RollData} rollData
     * @returns {{[key: string]: number}} Totals, keyed by flag
    */
    sumEntries(rollData) {
        return this.#sumByFlag ??= this.#calculateSums(rollData ?? {});
    }

    /**
     * Gets the sum of all values for the given flag.
     * @param {string} flag - The flag to fetch the total for
     * @param {RollData} rollData
     * @returns {number} - The total for the given flag
    */
    sumOfFlag(flag, rollData) {
        return this.sumEntries(rollData)[flag];
    }

    /**
     * Gets the sum of all values.
     * @param {RollData} rollData
     * @returns {number} - The combined total for all flags
    */
    sumAll(rollData) {
        return Object.values(this.sumEntries(rollData)).reduce((sum, current) => sum + current, 0);
    }
}
