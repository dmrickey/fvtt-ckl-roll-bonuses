import { textInputAndKeyValueSelect } from "../../handlebars-handlers/bonus-inputs/text-input-and-key-value-select.mjs";
import { FormulaCacheHelper, KeyedDFlagHelper, getDocDFlags } from "../../util/flag-helpers.mjs";
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize } from "../../util/localize.mjs";
import { signed } from "../../util/to-signed-string.mjs";
import { SpecificBonuses } from '../all-specific-bonuses.mjs';

const key = 'school-dc';
const formulaKey = 'school-dc-formula';

FormulaCacheHelper.registerUncacheableDictionaryFlag(key);
FormulaCacheHelper.registerDictionaryFlag(formulaKey);

Hooks.once('ready', () =>
    SpecificBonuses.registerSpecificBonus(
        { key },
        formulaKey,
    )
);

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
        props.push(localize('dc-label-mod', { mod: signed(offset), label: school }));
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
        const label = localize('dc-label-mod', { mod: signed(offset), label: school });
        const hint = hintcls.create(label, [], { hint: localize(key) });
        return hint;
    }
});

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const currentSchool = getDocDFlags(item, key)[0];
    if (!currentSchool) {
        return;
    }

    const total = FormulaCacheHelper.getDictionaryFlagValue(item, formulaKey);
    if (!total) {
        return;
    }

    const school = pf1.config.spellSchools[currentSchool] ?? currentSchool;
    const label = localize('dc-label-mod', { mod: signed(total), label: school });

    const hint = hintcls.create(label, [], { hint: localize(key) });
    return hint;
});

Hooks.on('pf1GetRollData', (
    /** @type {ItemAction} */ action,
    /** @type {RollData} */ rollData
) => {
    if (!(action instanceof pf1.components.ItemAction)) {
        return;
    }

    const { actor } = action;
    if (!actor) {
        return;
    }

    const { item } = action;
    if (!(item instanceof pf1.documents.item.ItemSpellPF) || !rollData) {
        return;
    }

    const helper = new KeyedDFlagHelper(actor, { onlyIncludeAllFlags: true, mustHave: { [key]: item.system.school } }, key, formulaKey);
    const offset = helper.sumOfFlags(formulaKey);

    rollData.dcBonus ||= 0;
    rollData.dcBonus += offset;
});

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;


    if (item.system.flags.dictionary[key] === undefined) {
        return;
    }

    const current = getDocDFlags(item, key)[0];
    const { spellSchools } = pf1.config;
    const choices = Object.keys(spellSchools)
        .map((key) => ({ key, label: spellSchools[key] }));

    textInputAndKeyValueSelect({
        item,
        key,
        label: localize(key),
        parent: html,
        select: { current, choices, key },
        text: { current: getDocDFlags(item, formulaKey)[0] || '', key: formulaKey },
    });
});
