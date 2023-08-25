import { textInputAndKeyValueSelect } from "../../handlebars-handlers/bonus-inputs/text-input-and-key-value-select.mjs";
import { getDocDFlags, KeyedDFlagHelper } from "../../util/flag-helpers.mjs";
import { localHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize } from "../../util/localize.mjs";
import { signed } from "../../util/to-signed-string.mjs";

const key = 'schoolClOffset';
const formulaKey = 'schoolClOffsetFormula';

// add Info to chat card
Hooks.on(localHooks.itemGetTypeChatData, (
    /** @type {ItemPF} */ item,
    /** @type {string[]} */ props,
    /** @type {RollData} */ _rollData,
) => {
    if (!item || !(item instanceof pf1.documents.item.ItemSpellPF)) return;
    const { actor } = item;
    if (!actor) return;

    const helper = new KeyedDFlagHelper(actor, key, formulaKey);
    const matches = helper.getItemDictionaryFlagsWithAllFlagsAndMatchingFlag(key, item.system.school);
    const formulas = Object.values(matches).map((o) => o[formulaKey])
    const offset = formulas
        .map(x => RollPF.safeTotal(x, actor.getRollData()))
        .reduce((acc, cur) => acc + cur, 0);

    if (offset) {
        const school = pf1.config.spellSchools[item.system.school] ?? item.system.school;
        props.push(localize('cl-label-mod', { mod: signed(offset), label: school }));
    }
});


// register hint on spell
registerItemHint((hintcls, actor, item, _data) => {
    if (!item || !(item instanceof pf1.documents.item.ItemSpellPF)) return;
    if (!actor) return;

    const helper = new KeyedDFlagHelper(actor, key, formulaKey);
    const matches = helper.getItemDictionaryFlagsWithAllFlagsAndMatchingFlag(key, item.system.school);
    const formulas = Object.values(matches).map((o) => o[formulaKey])
    const offset = formulas
        .map(x => RollPF.safeTotal(x, actor.getRollData()))
        .reduce((acc, cur) => acc + cur, 0);

    if (offset) {
        const school = pf1.config.spellSchools[item.system.school] ?? item.system.school;
        const label = localize('cl-label-mod', { mod: signed(offset), label: school });
        const hint = hintcls.create(label, [], { hint: localize(key) });
        return hint;
    }
});

// register hint on ability
registerItemHint((hintcls, actor, item, _data) => {
    const currentSchool = getDocDFlags(item, key)[0]?.toString();
    if (!currentSchool) {
        return;
    }

    const { spellSchools } = pf1.config;
    const formula = getDocDFlags(item, formulaKey)[0];
    const total = RollPF.safeTotal(formula, actor?.getRollData() ?? {})
    if (!total) {
        return;
    }

    /**
     *
     * @param {number} t
     * @param {string} s
     * @returns
     */
    const getHint = (t, s) => {
        const mod = signed(t);
        return localize('cl-label-mod', { mod, label: spellSchools[s] ?? s });
    }
    const label = getHint(+total, currentSchool);

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

    const item = action?.item;
    if (!(item instanceof pf1.documents.item.ItemSpellPF) || item?.type !== 'spell' || !item.system?.school || !rollData) {
        return;
    }

    // todo some day change this back to use rollData.dFlags
    const flags = new KeyedDFlagHelper(action?.actor || rollData.dFlags, key, formulaKey)
        .getItemDictionaryFlagsWithAllFlags();
    const matches = Object.values(flags)
        .filter((offset) => offset[key] === item.system.school);

    if (!matches.length) {
        return;
    }

    const formulas = Object.values(matches).map((o) => o[formulaKey])
    const offset = formulas
        .map((x) => RollPF.safeTotal(x, rollData))
        .reduce((acc, cur) => acc + cur, 0);

    rollData.cl ||= 0;
    rollData.cl += offset;
});

/**
 * @param {string} html
 */
Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    const { spellSchools } = pf1.config;

    const hasKey = item.system.flags.dictionary[key] !== undefined
        || item.system.flags.dictionary[formulaKey] !== undefined;
    if (!hasKey) {
        return;
    }

    const current = getDocDFlags(item, key)[0];
    const formula = getDocDFlags(item, formulaKey)[0];
    const choices = Object.keys(spellSchools)
        .map((key) => ({ key, label: spellSchools[key] }));

    textInputAndKeyValueSelect({
        text: { current: formula, key: formulaKey },
        select: { current, choices, key },
        item,
        key,
        label: localize(key),
        parent: html
    });
});
