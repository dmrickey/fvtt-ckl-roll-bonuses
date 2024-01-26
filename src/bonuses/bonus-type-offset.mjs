import { textInputAndKeyValueSelect } from "../handlebars-handlers/bonus-inputs/text-input-and-key-value-select.mjs";
import { KeyedDFlagHelper, getDocDFlags } from "../util/flag-helpers.mjs";
import { localHooks } from "../util/hooks.mjs";
import { localize } from "../util/localize.mjs";

const bonusKey = 'bonus-type-offset';
const formulaKey = 'bonus-type-offset-formula';

/**
 * @param {ItemChange} itemChange
 * @param {object} obj
 * @param {number | string} obj.value
 */
function patchChangeValue(itemChange, { value }) {
    const actor = itemChange.parent?.actor;
    if (!actor) {
        return value;
    }

    const flags = new KeyedDFlagHelper(actor, bonusKey, formulaKey).getItemDictionaryFlagsWithAllFlags();
    const matches = Object.values(flags)
        .filter((offset) => offset[bonusKey] === itemChange.modifier);

    if (!matches.length) {
        return value;
    }

    const formulas = Object.values(matches).map((o) => o[formulaKey]);
    const offset = formulas
        .map(x => RollPF.safeTotal(x, actor.getRollData()))
        .reduce((acc, cur) => acc + cur, 0);
    value = isNaN(+value) ? `${value} + ${offset}` : (+value + offset);
}
Hooks.on(localHooks.patchChangeValue, patchChangeValue);

/**
 * @param {string} html
 */
Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, item },
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
