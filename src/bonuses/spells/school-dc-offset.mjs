import { MODULE_NAME } from "../../consts.mjs";
import { addNodeToRollBonus } from "../../handlebars-handlers/roll-bonus-on-actor-sheet.mjs";
import { KeyedDFlagHelper, getDocDFlags } from "../../util/flag-helpers.mjs";
import { localHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize } from "../../util/localize.mjs";
import { signed } from "../../util/to-signed-string.mjs";

const key = 'school-dc';
const formulaKey = 'school-dc-formula';

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
        props.push(localize('dc-label-mod', { mod: signed(offset), label: school }));
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
        const label = localize('dc-label-mod', { mod: signed(offset), label: school });
        const hint = hintcls.create(label, [], { hint: localize(key) });
        return hint;
    }
});

// register hint on ability
registerItemHint((hintcls, actor, item, _data) => {
    const currentSchool = getDocDFlags(item, key)[0];
    if (!currentSchool) {
        return;
    }

    const formula = getDocDFlags(item, formulaKey)[0];
    const total = RollPF.safeTotal(formula, actor?.getRollData() ?? {});
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

    const helper = new KeyedDFlagHelper(actor, key, formulaKey);
    const matches = helper.getItemDictionaryFlagsWithAllFlagsAndMatchingFlag(key, item.system.school);
    const formulas = Object.values(matches).map((o) => o[formulaKey])
    const offset = formulas
        .map((x) => RollPF.safeTotal(x, rollData))
        .reduce((acc, cur) => acc + cur, 0);

    rollData.dcBonus ||= 0;
    rollData.dcBonus += offset;
});


/**
 * @type {Handlebars.TemplateDelegate}
 */
let focusSelectorTemplate;
Hooks.once(
    'setup',
    async () => focusSelectorTemplate = await getTemplate(`modules/${MODULE_NAME}/hbs/labeled-formula-key-value-selector.hbs`)
);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    const { spellSchools } = pf1.config;

    if (item.system.flags.dictionary[key] === undefined) {
        return;
    }

    const current = getDocDFlags(item, key)[0];

    if (Object.keys(spellSchools).length && !current) {
        item.setItemDictionaryFlag(key, Object.keys(spellSchools)[0]);
    }

    const templateData = {
        choices: spellSchools,
        current,
        formula: getDocDFlags(item, formulaKey)[0] || '',
        key,
        label: localize(key),
    };

    const div = document.createElement('div');
    div.innerHTML = focusSelectorTemplate(templateData, { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true });

    const input = div.querySelector(`#text-input-${key}`);
    input?.addEventListener(
        'change',
        async (event) => {
            // @ts-ignore - event.target is HTMLTextAreaElement
            const /** @type {HTMLTextAreaElement} */ target = event.target;
            await item.setItemDictionaryFlag(formulaKey, target?.value);
        },
    );

    const select = div.querySelector(`#key-value-selector-${key}`);
    select?.addEventListener(
        'change',
        async (event) => {
            if (!key) return;
            // @ts-ignore - event.target is HTMLTextAreaElement
            const /** @type {HTMLTextAreaElement} */ target = event.target;
            await item.setItemDictionaryFlag(key, target?.value);
        },
    );

    addNodeToRollBonus(html, div);
});
