import { textInputAndKeyValueSelect } from "../handlebars-handlers/bonus-inputs/text-input-and-key-value-select.mjs";
import { KeyedDFlagHelper, getDocDFlags, FormulaCacheHelper } from "../util/flag-helpers.mjs";
import { HookWrapperHandler, localHooks } from "../util/hooks.mjs";
import { localize } from "../util/localize.mjs";

const bonusKey = 'change-type-offset';
const formulaKey = 'change-type-offset-formula';

FormulaCacheHelper.registerDictionaryFlag(formulaKey);

/**
 * @param {number | string} value
 * @param {ItemChange} itemChange
 * @returns {number | string}
 */
function patchChangeValue(value, itemChange) {
    const actor = itemChange.parent?.actor;
    if (!actor) {
        return value;
    }

    const helper = new KeyedDFlagHelper(
        actor,
        {
            onlyIncludeAllFlags: true,
            mustHave: {
                [bonusKey]: (value) => value === itemChange.modifier,
            }
        },
        bonusKey,
        formulaKey);

    const offset = helper.sumOfFlags(formulaKey);
    if (offset) {
        value = isNaN(+value) ? `${value} + ${offset}` : (+value + offset);
    }

    return value;
}
HookWrapperHandler.registerHandler(localHooks.patchChangeValue, patchChangeValue);

/**
 * @param {string} html
 */
Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    const { bonusModifiers } = pf1.config;

    const hasKey = item.system.flags.dictionary[bonusKey] !== undefined
        || item.system.flags.dictionary[formulaKey] !== undefined;
    if (!hasKey) {
        return;
    }

    const current = getDocDFlags(item, bonusKey)[0];
    const formula = getDocDFlags(item, formulaKey)[0];

    const choices = Object.entries(bonusModifiers)
        .map(([key, label]) => ({ key, label }));

    textInputAndKeyValueSelect({
        text: { current: formula, key: formulaKey },
        select: { current, choices, key: bonusKey },
        item,
        key: bonusKey,
        label: localize(bonusKey),
        parent: html
    });
});
