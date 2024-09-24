import { MODULE_NAME } from '../consts.mjs';
import { radioInput } from '../handlebars-handlers/bonus-inputs/radio-input.mjs';
import { textInputAndKeyValueSelect } from "../handlebars-handlers/bonus-inputs/text-input-and-key-value-select.mjs";
import { FormulaCacheHelper } from "../util/flag-helpers.mjs";
import { LocalHookHandler, localHooks } from "../util/hooks.mjs";
import { localize, localizeBonusLabel, localizeBonusTooltip } from '../util/localize.mjs';
import { SpecificBonuses } from './all-specific-bonuses.mjs';

const key = 'change-modification';
const changeTypeKey = 'change-modification-type';
const formulaKey = 'change-modification-formula';
const setTypeKey = 'change-modification-set-type';

const setTypes = /** @type {const} */ (['add', 'set']);
/**
 *
 * @param {typeof setTypes[keyof typeof setTypes]} id
 * @returns {string}
 */
const setLabelKey = (id) => {
    switch (id) {
        case 'add': return 'PF1.Application.ChangeEditor.Operator.Add';
        case 'set': return 'PF1.Application.ChangeEditor.Operator.Set';
    }
    throw new Error('should never happen');
};

export {
    key as changeTypeOffsetKey,
    formulaKey as changeTypeOffsetFormulaKey,
}
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#change-modifier';

FormulaCacheHelper.registerModuleFlag(formulaKey);

SpecificBonuses.registerSpecificBonus({ journal, key });

/**
 * @param {ItemPF} item
 * @returns {typeof setTypes[keyof typeof setTypes]}
 */
const getOffsetType = (item) => item.getFlag(MODULE_NAME, setTypeKey) || setTypes[0];

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

    const bonuses = (actor[MODULE_NAME][key] ?? [])
        .filter((x) => x.getFlag(MODULE_NAME, changeTypeKey) === itemChange.type);
    if (!bonuses.length) {
        return value;
    }

    const sets = bonuses
        .filter((x) => getOffsetType(x) === 'set');
    if (sets.length) {
        const item = sets.at(-1);
        if (!item) return 0;
        const value = FormulaCacheHelper.getModuleFlagValue(item, formulaKey);
        return value;
    }

    // if there are no 'set', then all are 'offset' so no need for second filter
    const offset = bonuses.reduce((acc, item) => acc + FormulaCacheHelper.getModuleFlagValue(item, formulaKey), 0);
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
        label: localizeBonusLabel(formulaKey),
        tooltip: localizeBonusTooltip(formulaKey),
        parent: html,
        select: { current, choices, key: changeTypeKey },
        text: { current: formula, key: formulaKey },
    }, {
        canEdit: isEditable,
        isModuleFlag: true,
    });

    radioInput(
        {
            item,
            journal,
            parent: html,
            key: setTypeKey,
            values: setTypes.map((t) => ({
                id: t,
                label: localize(setLabelKey(t)),
            })),
        },
        {
            canEdit: isEditable
        },
    );
});
