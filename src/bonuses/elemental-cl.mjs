import { MODULE_NAME } from "../consts.mjs";
import { addNodeToRollBonus } from "../roll-bonus-on-actor-sheet.mjs";
import { KeyedDFlagHelper, getDocDFlags } from "../util/flag-helpers.mjs";
import { registerItemHint } from "../util/item-hints.mjs";
import { localize } from "../util/localize.mjs";
import { truthiness } from "../util/truthiness.mjs";


const key = 'elemental-cl';
const formulaKey = 'elemental-cl-formula';

const damageElements = [
    'acid',
    'cold',
    'electric',
    'fire'
];

registerItemHint((hintcls, _actor, item, _data) => {
    const currentElement = getDocDFlags(item, key)[0];
    if (!currentElement) {
        return;
    }

    const label = pf1.registry.damageTypes.get(`${currentElement}`) ?? currentElement;

    const hint = hintcls.create(label.name, [], {});
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
    if (!(item instanceof pf1.documents.item.ItemSpellPF) || item?.type !== 'spell' || !rollData) {
        return;
    }

    const damageTypes = action.data.damage.parts
        // @ts-ignore
        .map(({ type }) => type)
        // @ts-ignore
        .flatMap(({ custom, values }) => ([...custom.split(';').map(x => x.trim()), ...values]))
        .filter(truthiness);

    const flags = new KeyedDFlagHelper(action?.actor || rollData.dFlags, key, formulaKey)
        .getDFlagsWithAllFlagsByItem();
    const matches = Object.values(flags)
        .filter((offset) => damageTypes.includes(`${offset[key]}`));

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

    const values = matches.map((x) => RollPF.safeTotal(x[formulaKey], rollData) || 0);

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
 * @type {Handlebars.TemplateDelegate}
 */
let hbsTemplate;
Hooks.once(
    'setup',
    async () => hbsTemplate = await getTemplate(`modules/${MODULE_NAME}/hbs/labled-formula-key-value-selector.hbs`)
);

Hooks.on('renderItemSheet', (
    /** @type {{ }} */ _app,
    /** @type {[HTMLElement]} */[html],
    /** @type {{ item: ItemPF; }} */ data
) => {
    const { item } = data;


    if (item.system.flags.dictionary[key] === undefined) {
        return;
    }

    const current = getDocDFlags(item, key)[0];

    // let elements = Object.fromEntries(damageElements.map(k => [k, pf1.registry.damageTypes.get(k)]));
    const choices = damageElements.reduce((acc, cur) => ({ ...acc, [cur]: pf1.registry.damageTypes.get(cur)?.name || cur }), {});
    if (Object.keys(choices).length && !current) {
        item.setItemDictionaryFlag(key, Object.keys(choices)[0]);
    }

    const templateData = {
        choices,
        current,
        formula: getDocDFlags(item, formulaKey)[0] || '',
        key,
        label: localize(key),
    };

    const div = document.createElement('div');
    div.innerHTML = hbsTemplate(templateData, { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true });

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
            // @ts-ignore - event.target is HTMLTextAreaElement
            const /** @type {HTMLTextAreaElement} */ target = event.target;
            await item.setItemDictionaryFlag(key, target?.value);
        },
    );

    addNodeToRollBonus(html, div);
});
