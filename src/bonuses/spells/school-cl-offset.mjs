import { MODULE_NAME } from "../../consts.mjs";
import { addNodeToRollBonus } from "../../roll-bonus-on-actor-sheet.mjs";
import { getDocDFlags, KeyedDFlagHelper } from "../../util/flag-helpers.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";

const schoolClOffset = 'schoolClOffset';
const schoolClOffsetFormula = 'schoolClOffsetFormula';

// todo get rid of total and just calculate it from roll data as needed (if it can be done without getting stuck in a recursive loop)
const schoolClOffsetTotal = 'schoolClOffsetTotal';

/**
 * @type {Handlebars.TemplateDelegate}
 */
let clOffsetTemplate;
Hooks.once(
    'setup',
    async () => clOffsetTemplate = await getTemplate(`modules/${MODULE_NAME}/hbs/school-cl-offset.hbs`)
);

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

    const flags = new KeyedDFlagHelper(rollData.dFlags, schoolClOffset, schoolClOffsetTotal)
        .getDFlagsWithAllFlagsByItem();
    const matches = Object.values(flags)
        .filter((offset) => offset[schoolClOffset] === item.system.school);

    if (!matches.length) {
        return;
    }

    /**
     * @param {number} value
     */
    const offsetCl = (value) => {
        rollData.cl ||= 0;
        rollData.cl += value;
    }

    const values = matches.map((x) => +x[schoolClOffsetTotal] || 0);

    const max = Math.max(...values);
    if (max > 0) {
        offsetCl(max);
    }

    const min = Math.min(...values);
    if (min < 0) {
        offsetCl(min);
    }
});

/**
 * @param {string} html
 */
Hooks.on('renderItemSheet', (
    /** @type {{ actor: ActorPF; }} */ app,
    /** @type {[HTMLElement]} */[html],
    /** @type {{ item: ItemPF; }} */ data
) => {
    const { actor } = app;
    const { item } = data;

    const { spellSchools } = pf1.config;

    const hasKey = item.system.flags.dictionary[schoolClOffset] !== undefined
        || item.system.flags.dictionary[schoolClOffsetFormula] !== undefined;
    if (!hasKey) {
        return;
    }

    const currentSchool = getDocDFlags(item, schoolClOffset)[0];
    const formula = getDocDFlags(item, schoolClOffsetFormula)[0];

    if (Object.keys(spellSchools).length && !currentSchool) {
        item.setItemDictionaryFlag(schoolClOffset, Object.keys(spellSchools)[0]);
    }

    const templateData = { spellSchools, currentSchool, formula };

    const div = document.createElement('div');
    div.innerHTML = clOffsetTemplate(templateData, { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true });

    const input = div.querySelector('#school-cl-offset-formula');
    const select = div.querySelector('#school-cl-offset');

    input?.addEventListener(
        'change',
        async (event) => {
            // @ts-ignore - target is HTMLInputElement
            const newFormula = event.target.value;
            await item.setItemDictionaryFlag(schoolClOffsetFormula, newFormula);

            const newTotal = RollPF.safeTotal(newFormula, actor.getRollData());
            await item.setItemDictionaryFlag(schoolClOffsetTotal, newTotal);
        },
    );

    select?.addEventListener(
        'change',
        async (event) => {
            // @ts-ignore - target is HTMLInputElement
            await item.setItemDictionaryFlag(schoolClOffset, event.target.value);
        },
    );

    addNodeToRollBonus(html, div);
});

registerItemHint((hintcls, _actor, item, _data) => {
    const currentSchool = getDocDFlags(item, schoolClOffset)[0]?.toString();
    if (!currentSchool) {
        return;
    }

    const { spellSchools } = pf1.config;
    const total = getDocDFlags(item, schoolClOffsetTotal)[0];
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
        const signed = `+${t}`.replace("+-", "-");
        return `CL ${signed} (${spellSchools[s] ?? s})`;
    }
    const label = getHint(+total, currentSchool);

    const hint = hintcls.create(label, [], {});
    return hint;
});
