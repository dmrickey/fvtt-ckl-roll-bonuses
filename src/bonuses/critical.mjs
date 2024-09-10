import { textInput } from "../handlebars-handlers/bonus-inputs/text-input.mjs";
import { showEnabledLabel } from '../handlebars-handlers/enabled-label.mjs';
import { intersection } from '../util/array-intersects.mjs';
import { hasAnyBFlag, getDocDFlagsStartsWith, FormulaCacheHelper } from "../util/flag-helpers.mjs";
import { LocalHookHandler, customGlobalHooks, localHooks } from "../util/hooks.mjs";
import { registerItemHint } from "../util/item-hints.mjs";
import { localize } from "../util/localize.mjs";
import { signed } from "../util/to-signed-string.mjs";
import { truthiness } from '../util/truthiness.mjs';

const keenAll = 'keen-all';
const keenSelf = 'keen-self';
const keenId = (/** @type {IdObject} */ { id }) => `keen_${id}`;

const critOffsetAll = 'crit-offset-all';
const critOffsetSelf = 'crit-offset-self';
const critOffsetId = (/** @type {IdObject} */ { id }) => `crit-offset_${id}`;

const critMultOffsetAll = 'crit-mult-offset-all';
const critMultOffsetSelf = 'crit-mult-offset-self';
const critMultOffsetId = (/** @type {IdObject} */ { id }) => `crit-mult-offset_${id}`;

const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#critical-helpers';

FormulaCacheHelper.registerDictionaryFlag(critOffsetSelf, critOffsetAll, critMultOffsetSelf, critMultOffsetAll);
FormulaCacheHelper.registerPartialDictionaryFlag('crit-offset_', 'crit-mult-offset_');

/**
 * @param {ItemPF} item
 * @returns {boolean} true if this item has a legacy crit flag
 */
export const hasLegacyCritFlag = (item) => !!Object.keys(getDocDFlagsStartsWith(item, 'crit-')).length;

// register keen on bonus
registerItemHint((hintcls, _actor, item, _data) => {
    const bFlags = Object.entries(item.system?.flags?.boolean ?? {})
        .filter(([_, value]) => !!value)
        .map(([key, _]) => key);

    const hasKeen = bFlags.find(flag => flag.startsWith('keen'));

    if (!hasKeen) return;

    const hint = hintcls.create(localize('keen'), [], {});
    return hint;
});

// register crit offset hint on bonus
registerItemHint((hintcls, _actor, item, _data,) => {
    // return early if it has a self mod because that's encompassed in the "show on target" hint
    if (item.getItemDictionaryFlag(critOffsetSelf)) return;

    const formula = [
        FormulaCacheHelper.getDictionaryFlagFormula(item, critOffsetAll)[critOffsetAll],
        ...Object.values(FormulaCacheHelper.getPartialDictionaryFlagFormula(item, 'crit-offset_')),
    ]
        .filter(truthiness)
        .join(' + ');

    const roll = RollPF.safeRollSync(formula);
    if (roll.isNumber) {
        const mod = roll.total;
        if (!mod) {
            return;
        }

        const label = localize('crit-offset-mod', { mod: signed(mod) });
        const hint = hintcls.create(label, [], {});
        return hint;
    }
    else {
        const hint = hintcls.create(localize('crit-offset'), [], { hint: roll.simplifiedFormula });
        return hint;
    }
});

// register crit mult hint on bonus
registerItemHint((hintcls, _actor, item, _data,) => {
    // return early if it has a self mod because that's encompassed in the "show on target" hint
    if (item.getItemDictionaryFlag(critMultOffsetSelf)) return;

    const formula = [
        FormulaCacheHelper.getDictionaryFlagFormula(item, critMultOffsetAll)[critMultOffsetAll],
        ...Object.values(FormulaCacheHelper.getPartialDictionaryFlagFormula(item, 'crit-mult-offset_')),
    ]
        .filter(truthiness)
        .join(' + ');

    const roll = RollPF.safeRollSync(formula);
    if (roll.isNumber) {
        const mod = roll.total;
        if (!mod) {
            return;
        }

        const label = localize('crit-mult-mod', { mod: signed(mod) });
        const hint = hintcls.create(label, [], {});
        return hint;
    }
    else {
        const hint = hintcls.create(localize('crit-mult'), [], { hint: roll.simplifiedFormula });
        return hint;
    }
});

// register crit bonus on specific target
registerItemHint((hintcls, actor, item, _data) => {
    if (!actor || !item?.defaultAction) return;

    const isBroken = !!item.system.broken;

    const action = item.defaultAction;
    if (!(action?.hasAttack && action.data.ability?.critMult > 1)) return;

    const multFlags = [critMultOffsetAll, critMultOffsetId(action), critMultOffsetId(item)]
    const offsetFlags = [critOffsetAll, critOffsetId(item), critOffsetId(action)];
    const helper = new KeyedDFlagHelper(actor, {}, ...multFlags, ...offsetFlags);

    const getMult = () => {
        if (isBroken) return 2;

        const sum = helper.sumOfFlags(...multFlags)
            + FormulaCacheHelper.getDictionaryFlagValue(item, critMultOffsetSelf);
        const mult = +(action.data.ability.critMult || 2) + sum;
        return mult;
    }

    const getRange = () => {
        if (isBroken) return 20;

        const current = action.data.ability.critRange;

        const hasKeen = item.hasItemBooleanFlag(keenSelf)
            || hasAnyBFlag(actor, keenAll, keenId(item), keenId(action));

        let range = hasKeen
            ? current * 2 - 21
            : current;

        const sum = helper.sumOfFlags(...offsetFlags)
            + FormulaCacheHelper.getDictionaryFlagValue(item, critOffsetSelf);

        range -= sum;
        range = Math.clamped(range, 2, 20);
        return range;
    }

    const mult = getMult();
    const range = getRange();

    if (mult === action.data.ability.critMult
        && range === action.data.ability.critRange
    ) return;

    const rangeFormat = range === 20 ? '20' : `${range}-20`;
    const label = `${rangeFormat}/x${mult}`;
    const hint = hintcls.create(label, [], {});
    return hint;
});

Hooks.on('pf1GetRollData', (
    /** @type {ItemAction} */ action,
    /** @type {RollData} */ rollData
) => {
    if (!(action instanceof pf1.components.ItemAction) || !rollData?.action?.ability) {
        return;
    }
    const { item } = action;
    const isBroken = !!item.system.broken;

    const { actor } = action;
    if (!actor) {
        return;
    }

    // update critMult
    const calculateMult = () => {
        if (isBroken) {
            return 2;
        }

        const sum = new KeyedDFlagHelper(actor, {}, critMultOffsetAll, critMultOffsetId(action), critMultOffsetId(item))
            .sumAll()
            + FormulaCacheHelper.getDictionaryFlagValue(item, critMultOffsetSelf);

        return +(rollData.action?.ability.critMult || 2) + sum;
    };

    const mult = calculateMult();
    rollData.action.ability.critMult = mult;
    // end update critMult

    // update critRange
    const calculateRange = () => {
        const current = rollData.action?.ability.critRange ?? 20;

        if (isBroken) {
            return 20;
        }

        const hasKeen = item.hasItemBooleanFlag(keenSelf)
            || hasAnyBFlag(actor, keenAll, keenId(item), keenId(action));

        let range = hasKeen
            ? current * 2 - 21
            : current;

        const flags = [critOffsetAll, critOffsetId(item), critOffsetId(action)];
        const mod = new KeyedDFlagHelper(actor, {}, ...flags).sumAll()
            + FormulaCacheHelper.getDictionaryFlagValue(item, critOffsetSelf);

        range -= mod;
        range = Math.clamped(range, 2, 20);
        return range;
    };

    const range = calculateRange();
    rollData.action.ability.critRange = range;
    // end update critRange
});

/**
 * @param {number} current
 * @param {ItemAction} action
 * @returns {number}
 */
function handleItemActionCritRangeWrapper(current, action) {
    const { actor, item } = action;

    if (!!item.system.broken) {
        return 20;
    }

    const hasKeen = item.hasItemBooleanFlag(keenSelf)
        || hasAnyBFlag(actor, keenAll, keenId(item), keenId(action));

    const offsetFlags = [critOffsetAll, critOffsetId(item), critOffsetId(action)];
    const offset = new KeyedDFlagHelper(actor, {}, ...offsetFlags).sumAll()
        + FormulaCacheHelper.getDictionaryFlagValue(item, critOffsetSelf);
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

Hooks.on(customGlobalHooks.actionUseFootnotes, (
    /** @type {ChatAttack} */ { action },
    /** @type {string[]}  */ notes,
) => {
    const hasKeen = action.item.hasItemBooleanFlag(keenSelf)
        || hasAnyBFlag(action.item.actor, keenAll, keenId(action.item), keenId(action));
    if (hasKeen) {
        notes.push(localize('keen'));
    }
});

/**
 *
 * @param {string} key
 * @returns {string}
 */
const labelLookup = (key) => {
    switch (key) {
        case critOffsetSelf: return localize(critOffsetSelf);
        case critOffsetAll: return localize(critOffsetAll);
        case critMultOffsetSelf: return localize(critMultOffsetSelf);
        case critMultOffsetAll: return localize(critMultOffsetAll);
        case keenAll: return localize(keenAll);
        case keenSelf: return localize(keenSelf);
    }

    if (key.includes('crit-offset_')) {
        const id = key.split('_')[1];
        return localize('crit-offset-targeted', { id });
    }

    if (key.includes('crit-mult-offset_')) {
        const id = key.split('_')[1];
        return localize('crit-mult-offset-targeted', { id });
    }

    if (key.includes('keen_')) {
        const id = key.split('_')[1];
        return localize('keen-id', { id });
    }

    throw new Error(`shouldn't be here`);
}

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    if (item.hasItemBooleanFlag(keenAll)) {
        showEnabledLabel({
            item,
            journal,
            key: keenAll,
            label: labelLookup(keenAll),
            parent: html,
        }, {
            canEdit: isEditable,
        });
    }
    if (item.hasItemBooleanFlag(keenSelf)) {
        showEnabledLabel({
            item,
            journal,
            key: keenSelf,
            label: labelLookup(keenSelf),
            parent: html,
        }, {
            canEdit: isEditable,
        });
    }
    const booleanFlags = getDocBFlagsStartsWith(item, 'keen_')
    booleanFlags.forEach((keen) => {
        showEnabledLabel({
            item,
            journal,
            key: keen,
            label: labelLookup(keen),
            parent: html,
        }, {
            canEdit: isEditable,
        });
    });

    const dictionaryFlags = getDocDFlagsStartsWith(item, 'crit-');

    // the current array only can have a single element since this is from an item and not an actor
    Object.entries(dictionaryFlags).forEach(([key, [current]]) => {
        textInput({
            current,
            item,
            journal,
            key,
            label: labelLookup(key),
            parent: html,
        }, {
            canEdit: isEditable,
            // @ts-ignore No better way to do this for now
            isModuleFlag: false,
        });
    });
});

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

class KeyedDFlagHelper {

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
            .filter((item) => this.#hasDFlag(item, flag));
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


    /**
     * @param {ItemPF} item
     * @param {string} flag
     * @returns {boolean} True if the item has the dictionary flag.
     */
    #hasDFlag(item, flag) {
        return item.system.flags.dictionary?.hasOwnProperty(flag);
    }
}
