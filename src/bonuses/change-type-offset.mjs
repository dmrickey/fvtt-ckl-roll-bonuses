import { textInputAndKeyValueSelect } from "../handlebars-handlers/bonus-inputs/text-input-and-key-value-select.mjs";
import { KeyedDFlagHelper, getDocDFlags, FormulaCacheHelper } from "../util/flag-helpers.mjs";
import { LocalHookHandler, localHooks } from "../util/hooks.mjs";
import { SpecificBonuses } from './all-specific-bonuses.mjs';

export const bonusKey = 'change-type-offset';
export const formulaKey = 'change-type-offset-formula';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#change-offset';

FormulaCacheHelper.registerUncacheableDictionaryFlag(bonusKey);
FormulaCacheHelper.registerDictionaryFlag(formulaKey);

Hooks.once('ready', () =>
    SpecificBonuses.registerSpecificBonus(
        { journal, key: bonusKey },
        formulaKey,
    ));

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
                [bonusKey]: (value) => value === itemChange.type,
            }
        },
        bonusKey,
        formulaKey,
    );

    const offset = helper.sumOfFlags(formulaKey);
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

    const hasKey = item.system.flags.dictionary[bonusKey] !== undefined
        || item.system.flags.dictionary[formulaKey] !== undefined;
    if (!hasKey) {
        return;
    }

    const current = getDocDFlags(item, bonusKey)[0];
    const formula = getDocDFlags(item, formulaKey)[0];

    const choices = Object.entries(bonusTypes)
        .map(([key, label]) => ({ key, label }));

    textInputAndKeyValueSelect({
        item,
        journal,
        parent: html,
        select: { current, choices, key: bonusKey },
        text: { current: formula, key: formulaKey },
    }, {
        canEdit: isEditable,
    });
});
