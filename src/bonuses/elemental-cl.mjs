import { MODULE_NAME } from "../consts.mjs";
import { addNodeToRollBonus } from "../handlebars-handlers/roll-bonus-on-actor-sheet.mjs";
import { KeyedDFlagHelper, getDocDFlags } from "../util/flag-helpers.mjs";
import { localHooks } from "../util/hooks.mjs";
import { registerItemHint } from "../util/item-hints.mjs";
import { localize } from "../util/localize.mjs";
import { signed } from "../util/to-signed-string.mjs";
import { truthiness } from "../util/truthiness.mjs";


const key = 'elemental-cl';
const formulaKey = 'elemental-cl-formula';

const damageElements = [
    'acid',
    'cold',
    'electric',
    'fire'
];

registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemSpellPF)) {
        return;
    }

    const action = item.firstAction;
    if (!action) {
        return;
    }

    const damageTypes = action.data.damage.parts
        .map(({ type }) => type)
        .flatMap(({ custom, values }) => ([...custom.split(';').map(x => x.trim()), ...values]))
        .filter(truthiness);

    const flags = new KeyedDFlagHelper(actor, key, formulaKey)
        .getItemDictionaryFlagsWithAllFlags();
    const matches = Object.values(flags)
        .filter((offset) => damageTypes.includes(`${offset[key]}`));

    const offset = matches
        .map((x) => RollPF.safeTotal(x[formulaKey], actor.getRollData()))
        .reduce((acc, cur) => acc + cur, 0);

    if (offset) {
        const elements = matches
            .map((x) => pf1.registry.damageTypes.get(`${x[key]}`)?.name ?? x[key])
            .join(', ');
        const label = localize('cl-label-mod', { mod: signed(offset), label: elements });
        const hint = hintcls.create(label, [], { hint: localize(key) });
        return hint;
    }
});

// register hint on ability
registerItemHint((hintcls, actor, item, _data) => {
    const currentElement = getDocDFlags(item, key)[0];
    if (!currentElement) {
        return;
    }

    const formula = getDocDFlags(item, formulaKey)[0];
    if (!formula) {
        return;
    }

    const total = RollPF.safeTotal(formula, actor?.getRollData() ?? {});
    if (!total) {
        return;
    }

    const mod = signed(total);
    const element = pf1.registry.damageTypes.get(`${currentElement}`)?.name ?? currentElement;
    const label = localize('cl-label-mod', { mod, label: element });

    const hint = hintcls.create(label, [], { hint: localize(key) });
    return hint;
});

Hooks.on(localHooks.itemGetTypeChatData, (
    /** @type {ItemPF} */ item,
    /** @type {string[]} */ props,
    /** @type {RollData} */ rollData,
) => {
    const { action } = rollData;
    if (!action) {
        return;
    }

    if (!(item instanceof pf1.documents.item.ItemSpellPF)) {
        return;
    }

    const damageTypes = action.damage.parts
        .map(({ type }) => type)
        .flatMap(({ custom, values }) => ([...custom.split(';').map(x => x.trim()), ...values]))
        .filter(truthiness);

    const flags = new KeyedDFlagHelper(item?.actor || rollData.dFlags, key, formulaKey)
        .getItemDictionaryFlagsWithAllFlags();
    const matches = Object.values(flags)
        .filter((offset) => damageTypes.includes(`${offset[key]}`));

    if (!matches.length) {
        return;
    }

    const offset = matches
        .map((x) => RollPF.safeTotal(x[formulaKey], rollData) || 0)
        .reduce((acc, cur) => acc + cur, 0);

    if (offset) {
        const elements = matches
            .map((x) => pf1.registry.damageTypes.get(`${x[key]}`)?.name ?? x[key])
            .join(', ');
        props.push(localize('cl-label-mod', { mod: signed(offset), label: elements }));
    }
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
        .map(({ type }) => type)
        .flatMap(({ custom, values }) => ([...custom.split(';').map(x => x.trim()), ...values]))
        .filter(truthiness);

    const flags = new KeyedDFlagHelper(action?.actor || rollData.dFlags, key, formulaKey)
        .getItemDictionaryFlagsWithAllFlags();
    const matches = Object.values(flags)
        .filter((offset) => damageTypes.includes(`${offset[key]}`));

    if (!matches.length) {
        return;
    }

    const offset = matches
        .map((x) => RollPF.safeTotal(x[formulaKey], rollData) || 0)
        .reduce((acc, cur) => acc + cur, 0);
    if (offset) {
        rollData.cl ||= 0;
        rollData.cl += offset;
    }
});

/**
 * @type {Handlebars.TemplateDelegate}
 */
let hbsTemplate;
Hooks.once(
    'setup',
    async () => hbsTemplate = await getTemplate(`modules/${MODULE_NAME}/hbs/labeled-formula-key-value-selector.hbs`)
);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (item.system.flags.dictionary[key] === undefined) {
        return;
    }

    const current = getDocDFlags(item, key)[0];

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
