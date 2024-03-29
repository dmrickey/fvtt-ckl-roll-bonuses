import { textInputAndKeyValueSelect } from "../../handlebars-handlers/bonus-inputs/text-input-and-key-value-select.mjs";
import { intersection } from "../../util/array-intersects.mjs";
import { FormulaCacheHelper, KeyedDFlagHelper, getDocDFlags } from "../../util/flag-helpers.mjs";
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize } from "../../util/localize.mjs";
import { signed } from "../../util/to-signed-string.mjs";
import { truthiness } from "../../util/truthiness.mjs";
import { SpecificBonuses } from '../all-specific-bonuses.mjs';

/**
 * @type {{cl: keyof(RollData), dc: keyof(RollData)}}
 */
const prop = {
    cl: 'cl',
    dc: 'dcBonus'
}

const damageElements = [
    'acid',
    'cold',
    'electric',
    'fire'
];

const regex = /([A-Za-z\- ])+/g;

/**
 * @param {ItemSpellPF} item
 * @returns {string[]}
 */
const getSpellDescriptors = (item) => {
    return [...(item?.system?.types || '').matchAll(regex)]
        .flatMap(([a]) => a.split('or'))
        .map((a) => a.trim().toLowerCase());
}

/**
 * @param {'cl' | 'dc'} t
 */
export function createElementalClOrDc(t) {
    const key = `elemental-${t}`;
    const formulaKey = `elemental-${t}-formula`;

    FormulaCacheHelper.registerUncacheableDictionaryFlag(key);
    FormulaCacheHelper.registerDictionaryFlag(formulaKey);

    Hooks.once('ready', () =>
        SpecificBonuses.registerSpecificBonus(
            { key },
            formulaKey,
        )
    );

    /**
     *
     * @param {ItemPF} item
     * @param {ItemAction?} action
     * @returns {undefined | { offset: number, elements: string[]}}
     */
    function getBonusesForItem(
        item,
        action = null,
    ) {
        if (!(item instanceof pf1.documents.item.ItemSpellPF)) {
            return;
        }

        const { actor } = item;
        if (!actor) {
            return;
        }

        if (!action) {
            action = item?.firstAction;
        }

        const damageTypes = action.data.damage.parts
            .map(({ type }) => type)
            .flatMap(({ custom, values }) => ([...custom.split(';').map(x => x.trim()), ...values]))
            .filter(truthiness)
            .map((x) => x.toLowerCase());
        const types = getSpellDescriptors(item);
        const domains = Object.keys(item.learnedAt?.domain || []).map((x) => x.toLowerCase());

        const comparators = damageElements.flatMap((element) => [element, pf1.registry.damageTypes.get(element)?.name?.toLowerCase() || element]);
        const toFind = intersection([...damageTypes, ...types, ...domains], comparators);

        const helper = new KeyedDFlagHelper(
            actor,
            {
                onlyIncludeAllFlags: true,
                mustHave: { [key]: (value) => toFind.includes(`${value}`) }
            },
            key,
            formulaKey
        );

        const offset = helper.sumOfFlags(formulaKey);

        if (offset) {
            const elements = helper.valuesForFlag(key)
                .map((value) => pf1.registry.damageTypes.get(`${value}`)?.name ?? value);
            return { offset, elements };
        }
    }

    // add info to chat card
    Hooks.on(customGlobalHooks.itemGetTypeChatData, (
    /** @type {ItemPF} */ item,
    /** @type {string[]} */ props,
    /** @type {RollData} */ rollData,
    ) => {
        const actionId = rollData.action?._id;
        if (!actionId) {
            return;
        }

        if (!(item instanceof pf1.documents.item.ItemSpellPF)) {
            return;
        }

        const action = item.actions.get(actionId);
        if (!action) {
            return;
        }

        const found = getBonusesForItem(item, action);

        if (found?.offset) {
            props.push(localize(`${t}-label-mod`, { mod: signed(found.offset), label: found.elements.join(', ') }));
        }
    });

    // register hint on affected spell
    registerItemHint((hintcls, _actor, item, _data) => {
        if (!(item instanceof pf1.documents.item.ItemSpellPF)) {
            return;
        }

        const found = getBonusesForItem(item);

        if (found?.offset) {
            const label = localize(`${t}-label-mod`, { mod: signed(found.offset), label: found.elements.join(', ') });
            const hint = hintcls.create(label, [], { hint: localize(key) });
            return hint;
        }
    });

    // register hint on source
    registerItemHint((hintcls, _actor, item, _data) => {
        const currentElement = getDocDFlags(item, key)[0];
        if (!currentElement) {
            return;
        }

        const total = FormulaCacheHelper.getDictionaryFlagValue(item, formulaKey);
        if (!total) {
            return;
        }

        const mod = signed(total);
        const element = pf1.registry.damageTypes.get(`${currentElement}`)?.name ?? currentElement;
        const label = localize(`${t}-label-mod`, { mod, label: element });

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

        const item = action?.item;
        if (!(item instanceof pf1.documents.item.ItemSpellPF) || item?.type !== 'spell' || !rollData) {
            return;
        }
        const found = getBonusesForItem(item, action);
        if (found?.offset) {
            rollData[prop[t]] ||= 0;
            rollData[prop[t]] += found.offset;
        }
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
        const choices = damageElements
            .map(element => ({ key: element, label: pf1.registry.damageTypes.get(element)?.name || element }));

        textInputAndKeyValueSelect({
            text: { current: getDocDFlags(item, formulaKey)[0] || '', key: formulaKey },
            select: { current, choices, key },
            item,
            key,
            label: localize(key),
            parent: html
        });
    });
}
