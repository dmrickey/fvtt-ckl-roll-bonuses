import { MODULE_NAME } from "../../consts.mjs";
import { addNodeToRollBonus } from "../../roll-bonus-on-actor-sheet.mjs";
import { KeyedDFlagHelper, getDocDFlags } from "../../util/flag-helpers.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize } from "../../util/localize.mjs";

const key = 'school-dc';
const formulaKey = 'school-dc-formula';

registerItemHint((hintcls, _actor, item, _data) => {
    const currentSchool = getDocDFlags(item, key)[0];
    if (!currentSchool) {
        return;
    }

    const school = pf1.config.spellSchools[currentSchool] ?? currentSchool;
    const label = localize(`${key}-hint`, { school });

    const hint = hintcls.create(label, [], {});
    return hint;
});

// before dialog pops up
Hooks.on('pf1PreActionUse', (/** @type {ActionUse} */actionUse) => {
    const { actor, item, shared } = actionUse;
    if (!(item instanceof pf1.documents.item.ItemSpellPF)) {
        return;
    }

    const helper = new KeyedDFlagHelper(actor, key, formulaKey);
    const matches = helper.getItemDictionaryFlagsWithAllFlagsAndMatchingFlag(key, item.system.school);
    const formulas = Object.values(matches).map((o) => o[formulaKey])
    const offset = formulas.reduce((acc, cur) => acc + RollPF.safeTotal(cur, actor.getRollData()), 0);
    shared.saveDC += offset ?? 0;
});

/**
 * @type {Handlebars.TemplateDelegate}
 */
let focusSelectorTemplate;
Hooks.once(
    'setup',
    async () => focusSelectorTemplate = await getTemplate(`modules/${MODULE_NAME}/hbs/labled-formula-key-value-selector.hbs`)
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
