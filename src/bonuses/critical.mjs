import { textInput } from "../handlebars-handlers/bonus-inputs/text-input.mjs";
import { hasAnyBFlag, getDocDFlagsStartsWith, KeyedDFlagHelper, FormulaCacheHelper } from "../util/flag-helpers.mjs";
import { LocalHookHandler, customGlobalHooks, localHooks } from "../util/hooks.mjs";
import { registerItemHint } from "../util/item-hints.mjs";
import { localize } from "../util/localize.mjs";
import { signed } from "../util/to-signed-string.mjs";
import { truthiness } from '../util/truthiness.mjs';

const selfKeen = 'keen-self';
const keenAll = 'keen-all';
const keenId = (/** @type {IdObject} */ { id }) => `keen_${id}`;

const critOffsetSelf = 'crit-offset-self';
const critOffsetAll = 'crit-offset-all';
const critOffsetId = (/** @type {IdObject} */ { id }) => `crit-offset_${id}`;

const critMultOffsetSelf = 'crit-mult-offset-self';
const critMultOffsetAll = 'crit-mult-offset-all';
const critMultOffsetId = (/** @type {IdObject} */ { id }) => `crit-mult-offset_${id}`;

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

    const roll = RollPF.safeRoll(formula);
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

    const roll = RollPF.safeRoll(formula);
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
    if (!actor || !item?.firstAction) return;

    const isBroken = !!item.system.broken;

    const action = item.firstAction;
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

        const hasKeen = item.hasItemBooleanFlag(selfKeen)
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

        const hasKeen = item.hasItemBooleanFlag(selfKeen)
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

    const hasKeen = item.hasItemBooleanFlag(selfKeen)
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

Hooks.on(customGlobalHooks.chatAttackFootnotes, (
    /** @type {ChatAttack} */ { action, attackNotes }
) => {
    const hasKeen = action.item.hasItemBooleanFlag(selfKeen)
        || hasAnyBFlag(action.item.actor, keenAll, keenId(action.item), keenId(action));
    if (hasKeen) {
        attackNotes.push(localize('keen'));
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
    }

    if (key.includes('crit-offset_')) {
        const id = key.split('_')[1];
        return localize('crit-offset-targeted', { id });
    }

    if (key.includes('crit-mult-offset_')) {
        const id = key.split('_')[1];
        return localize('crit-mult-offset-targeted', { id });
    }

    return "Crit";
}

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const has = getDocDFlagsStartsWith(item, 'crit-');

    // the current array only can have a single element since this is from an item and not an actor
    Object.entries(has).forEach(([key, [current]]) => {
        textInput({
            current,
            item,
            key,
            label: labelLookup(key),
            parent: html,
        });
    });
});
