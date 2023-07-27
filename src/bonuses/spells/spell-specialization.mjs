// +2 CL to chosen spell from school with Spell Focus
// https://www.d20pfsrd.com/feats/general-feats/spell-specialization/

import { MODULE_NAME } from "../../consts.mjs";
import { addNodeToRollBonus } from "../../roll-bonus-on-actor-sheet.mjs";
import { getDocDFlags, KeyedDFlagHelper } from "../../util/flag-helpers.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize } from "../../util/localize.mjs";
import { registerSetting } from "../../util/settings.mjs";
import { uniqueArray } from "../../util/unique-array.mjs";
import { spellFocusKey } from "./spell-focus.mjs";

const key = 'spell-specialization';
const compendiumId = 'CO2Qmj0aj76zJsew';

registerSetting({ key: key });

class Settings {
    static get spellSpecialization() { return Settings.#getSetting(key); }
    // @ts-ignore
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key).toLowerCase(); }
}

// register hint on spell
registerItemHint((hintcls, actor, item, _data) => {
    const helper = new KeyedDFlagHelper(actor, key);
    const specializations = helper.valuesForFlag(key);

    if (!specializations.includes(item?.name)) {
        return;
    }

    const hint = hintcls.create(localize('cl-mod', { mod: '+2' }), [], { hint: localize(key) });
    return hint;
});

// register hint on spell specialization
registerItemHint((hintcls, actor, item, _data) => {
    const current = getDocDFlags(item, key)[0]?.toString();
    if (!current) {
        return;
    }

    // grab the shortest spell name
    const names = actor.items
        ?.filter((i) => i.name === current && i instanceof pf1.documents.item.ItemSpellPF)
        .map(({ name }) => name)
        .sort((x, y) => x.length > y.length ? 1 : -1)
        ?? [];
    const name = names[0];
    if (!name) {
        return;
    }

    const hint = hintcls.create(name, [], {});
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
    if (!(item instanceof pf1.documents.item.ItemSpellPF)
        || item?.type !== 'spell'
        || !rollData
    ) {
        return;
    }

    const helper = new KeyedDFlagHelper(item.actor, key);
    const specializations = helper.stringValuesForFlag(key);
    if (!specializations.includes(item.name)) {
        return;
    }

    rollData.cl ||= 0;
    rollData.cl += 2;
});

/**
 * @type {Handlebars.TemplateDelegate}
 */
let clOffsetTemplate;
Hooks.once(
    'setup',
    async () => clOffsetTemplate = await getTemplate(`modules/${MODULE_NAME}/hbs/labeled-string-dropdown-selector.hbs`)
);

/**
 * @param {string} html
 */
Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    const hasKey = item.system.flags.dictionary[key] !== undefined;
    const hasName = item.name === Settings.spellSpecialization;
    const hasId = !!item?.flags?.core?.sourceId?.includes(compendiumId);
    if (!(hasKey || hasName || hasId)) {
        return;
    }

    const helper = new KeyedDFlagHelper(actor, spellFocusKey);
    const focuses = helper.stringValuesForFlag(spellFocusKey);
    const current = item.getItemDictionaryFlag(key);

    const spellChoices = actor?.items
        .filter(
            /** @returns {spell is ItemSpellPF} */
            (spell) => spell instanceof pf1.documents.item.ItemSpellPF
                && focuses.includes(spell.system.school))
        ?? [];
    const choices = uniqueArray(spellChoices.map(({ name }) => name)).sort();

    if (choices.length && !current) {
        item.setItemDictionaryFlag(key, choices[0]);
    }

    const templateData = {
        choices,
        current,
        key,
        label: localize(key),
    };

    const div = document.createElement('div');
    div.innerHTML = clOffsetTemplate(templateData, { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true });

    const select = div.querySelector(`#string-selector-${key}`);
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
