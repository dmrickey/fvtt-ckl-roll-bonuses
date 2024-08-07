import { textInputAndKeyValueSelect } from "../../handlebars-handlers/bonus-inputs/text-input-and-key-value-select.mjs";
import { FormulaCacheHelper, getDocDFlags, KeyedDFlagHelper } from "../../util/flag-helpers.mjs";
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize, localizeBonusLabel } from "../../util/localize.mjs";
import { signed } from "../../util/to-signed-string.mjs";

const key = 'schoolClOffset';
const formulaKey = 'schoolClOffsetFormula';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#*modify-spell-caster-level-(all-spells,-specific-school,-or-spec';

FormulaCacheHelper.registerUncacheableDictionaryFlag(key);
FormulaCacheHelper.registerDictionaryFlag(formulaKey);

// add Info to chat card
Hooks.on(customGlobalHooks.itemGetTypeChatData, (
    /** @type {ItemPF} */ item,
    /** @type {string[]} */ props,
    /** @type {RollData} */ _rollData,
) => {
    if (!item || !(item instanceof pf1.documents.item.ItemSpellPF)) return;
    const { actor } = item;
    if (!actor) return;

    const helper = new KeyedDFlagHelper(actor, { onlyIncludeAllFlags: true, mustHave: { [key]: item.system.school } }, key, formulaKey);
    const offset = helper.sumOfFlags(formulaKey);

    if (offset) {
        const school = pf1.config.spellSchools[item.system.school] ?? item.system.school;
        props.push(localize('cl-label-mod', { mod: signed(offset), label: school }));
    }
});

// register hint on spell
registerItemHint((hintcls, actor, item, _data) => {
    if (!item || !(item instanceof pf1.documents.item.ItemSpellPF)) return;
    if (!actor) return;

    const helper = new KeyedDFlagHelper(actor, { onlyIncludeAllFlags: true, mustHave: { [key]: item.system.school } }, key, formulaKey);
    const offset = helper.sumOfFlags(formulaKey);

    if (offset) {
        const school = pf1.config.spellSchools[item.system.school] ?? item.system.school;
        const label = localize('cl-label-mod', { mod: signed(offset), label: school });
        const hint = hintcls.create(label, [], { hint: localizeBonusLabel(key) });
        return hint;
    }
});

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const currentSchool = /** @type {keyof typeof pf1.config.spellSchools} */ (getDocDFlags(item, key)[0]);
    if (!currentSchool) {
        return;
    }

    const total = FormulaCacheHelper.getDictionaryFlagValue(item, formulaKey);
    if (!total) {
        return;
    }

    const mod = signed(total);
    const { spellSchools } = pf1.config;
    const label = localize('cl-label-mod', { mod, label: spellSchools[currentSchool] ?? currentSchool });

    const hint = hintcls.create(label, [], {});
    return hint;
});

Hooks.on('pf1GetRollData', (
    /** @type {ItemAction} */ action,
    /** @type {RollData} */ rollData
) => {
    if (!(action instanceof pf1.components.ItemAction)) {
        return;
    }
    const { actor, item } = action;

    if (!(item instanceof pf1.documents.item.ItemSpellPF) || item?.type !== 'spell' || !item.system?.school || !rollData || !actor) {
        return;
    }

    const helper = new KeyedDFlagHelper(actor, { onlyIncludeAllFlags: true, mustHave: { [key]: item.system.school } }, key, formulaKey);
    const offset = helper.sumOfFlags(formulaKey);

    rollData.cl ||= 0;
    rollData.cl += offset;
});

/**
 * @param {string} html
 */
Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const { spellSchools } = pf1.config;

    const hasKey = item.system.flags.dictionary[key] !== undefined
        || item.system.flags.dictionary[formulaKey] !== undefined;
    if (!hasKey) {
        return;
    }

    const current = getDocDFlags(item, key)[0];
    const formula = getDocDFlags(item, formulaKey)[0];
    const choices = Object.entries(spellSchools)
        .map(([key, label]) => ({ key, label }));

    textInputAndKeyValueSelect({
        item,
        journal,
        parent: html,
        select: { current, choices, key },
        text: { current: formula, key: formulaKey },
    }, {
        canEdit: isEditable,
    });
});
