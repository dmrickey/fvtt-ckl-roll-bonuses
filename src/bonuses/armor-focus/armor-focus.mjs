// armor focus - https://www.d20pfsrd.com/feats/combat-feats/armor-focus-combat/
// - AC for chosen armor type is increased by one.

import { addNodeToRollBonus } from "../../roll-bonus-on-actor-sheet.mjs";
import { armorFocusKey as key } from "./ids.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { KeyedDFlagHelper, getDocDFlags, hasAnyBFlag } from "../../util/flag-helpers.mjs";
import { localize } from "../../util/localize.mjs";
import { MODULE_NAME } from "../../consts.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { registerSetting } from "../../util/settings.mjs";
import { uniqueArray } from "../../util/unique-array.mjs";

const compendiumId = 'zBrrZynIB0EXagds';

registerSetting({ key: key });

class Settings {
    static get armorFocus() { return Settings.#getSetting(key); }
    // @ts-ignore
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key).toLowerCase(); }
}

// register hint on feat
registerItemHint((hintcls, _actor, item, _data) => {
    const current = item.getItemDictionaryFlag(key);
    if (current) {
        return hintcls.create(`${current}`, [], {});
    }
});

// register hint on focused item
registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemEquipmentPF)) return;

    const isArmor = item.isActive && item.system.slot === 'armor';
    const baseTypes = item.system.baseTypes;
    if (!baseTypes?.length) return;

    const armorFocuses = new KeyedDFlagHelper(actor.itemFlags.dictionary, key).valuesForFlag(key);
    const isFocused = intersects(armorFocuses, baseTypes);

    if (isArmor && isFocused) {
        const hint = hintcls.create(localize(key), [], {});
        return hint;
    }
});

/**
 * @param {ActorPF | ItemPF | ItemAction} doc
 * @param {RollData} rollData
 */
function handleArmorFocusRollData(doc, rollData) {
    if (!(doc instanceof pf1.documents.item.ItemEquipmentPF)) return;

    const actor = doc.actor;
    if (!actor) return;

    const armor = actor.items.find(
        /** @returns {item is ItemEquipmentPF} */
        (item) => item instanceof pf1.documents.item.ItemEquipmentPF && item.isActive && item.system.slot === 'armor');
    if (!armor) return;
    const baseTypes = armor.system.baseTypes;
    if (!baseTypes?.length) return;

    const armorFocuses = new KeyedDFlagHelper(actor.itemFlags.dictionary, key).valuesForFlag(key);
    const isFocused = intersects(armorFocuses, baseTypes);

    if (isFocused) {
        rollData.item.armor.value += 1;
    }
}
Hooks.on('pf1AddDefaultChanges', handleArmorFocusChange);

/**
 * @param {ActorPF} actor
 * @param {ItemChange[]} tempChanges
 */
function handleArmorFocusChange(actor, tempChanges) {
    const armorFocuses = new KeyedDFlagHelper(actor.itemFlags.dictionary, key).valuesForFlag(key);
    if (!armorFocuses.length) return;

    const armor = actor.items.find(
        /** @returns {item is ItemEquipmentPF} */
        (item) => item instanceof pf1.documents.item.ItemEquipmentPF && item.isActive && item.system.slot === 'armor');
    if (!armor) return;
    const baseTypes = armor.system.baseTypes;
    if (!baseTypes?.length) return;

    const isFocused = intersects(armorFocuses, baseTypes);
    if (!isFocused) return;

    tempChanges.push(
        new pf1.components.ItemChange({
            flavor: localize(key),
            formula: 1,
            modifier: "untypedPerm",
            subTarget: "aac",
        })
    );
}
Hooks.on('pf1GetRollData', handleArmorFocusRollData);

/**
 * @type {Handlebars.TemplateDelegate}
 */
let focusSelectorTemplate;
Hooks.once(
    'setup',
    async () => focusSelectorTemplate = await getTemplate(`modules/${MODULE_NAME}/hbs/labeled-string-dropdown-selector.hbs`)
);

Hooks.on('renderItemSheet', (
    /** @type {{}} */ _app,
    /** @type {[HTMLElement]} */[html],
    /** @type {{ item: ItemPF; }} */ { item },
) => {
    const name = item?.name?.toLowerCase() ?? '';

    if (!(name === Settings.armorFocus || item.system.flags.dictionary[key] !== undefined || item?.flags.core?.sourceId.includes(compendiumId))) {
        return;
    }

    const current = item.getItemDictionaryFlag(key);
    const choices = uniqueArray(item.actor?.items
        ?.filter(
            /** @returns {item is ItemEquipmentPF} */
            (item) => item.type === 'equipment'
                && item instanceof pf1.documents.item.ItemEquipmentPF
                && item.system.slot === 'armor')
        .flatMap((item) => item.system.baseTypes ?? []));

    if (choices?.length && !current) {
        item.setItemDictionaryFlag(key, choices[0]);
    }

    const templateData = { choices, current, label: localize(key), key };
    const div = document.createElement('div');
    div.innerHTML = focusSelectorTemplate(templateData, { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true });

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
