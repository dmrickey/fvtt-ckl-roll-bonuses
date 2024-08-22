import { MODULE_NAME } from '../consts.mjs';
import { textInputAndKeyValueSelect } from "../handlebars-handlers/bonus-inputs/text-input-and-key-value-select.mjs";
import { FormulaCacheHelper } from "../util/flag-helpers.mjs";
import { LocalHookHandler, localHooks } from "../util/hooks.mjs";
import { SpecificBonuses } from './all-specific-bonuses.mjs';

const key = 'change-type-offset';
const formulaKey = 'change-type-offset-formula';
export {
    key as changeTypeOffsetKey,
    formulaKey as changeTypeOffsetFormulaKey,
}
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#change-offset';

FormulaCacheHelper.registerModuleFlag(formulaKey);

SpecificBonuses.registerSpecificBonus({ journal, key: key });

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

    const offset = (actor[MODULE_NAME][key] ?? [])
        .filter((x) => x.getFlag(MODULE_NAME, key) === itemChange.type)
        .reduce((acc, item) => acc + FormulaCacheHelper.getModuleFlagValue(item, formulaKey), 0);
    if (offset) {
        value = isNaN(+value) ? `${value} + ${offset}` : (+value + offset);
    }

    return value;
}
LocalHookHandler.registerHandler(localHooks.patchChangeValue, patchChangeValue);

/**
 * @param {string} html
 */
Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const { bonusTypes } = pf1.config;

    const hasKey = item.hasItemBooleanFlag(key);
    if (!hasKey) {
        return;
    }

    const current = item.getFlag(MODULE_NAME, key);
    const formula = item.getFlag(MODULE_NAME, formulaKey);

    const choices = Object.entries(bonusTypes)
        .map(([key, label]) => ({ key, label }));

    textInputAndKeyValueSelect({
        item,
        journal,
        parent: html,
        select: { current, choices, key: key },
        text: { current: formula, key: formulaKey },
    }, {
        canEdit: isEditable,
        isModuleFlag: true,
    });
});
