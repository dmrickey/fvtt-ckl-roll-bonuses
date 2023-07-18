// https://www.d20pfsrd.com/feats/combat-feats/martial-focus-combat/
// +1 damage to chosen weapon group with proficient weapon

import { MODULE_NAME } from "../consts.mjs";
import { addNodeToRollBonus } from "../roll-bonus-on-actor-sheet.mjs";
import { intersects } from "../util/array-intersects.mjs";
import { KeyedDFlagHelper, getDocDFlags } from "../util/flag-helpers.mjs";
import { localHooks } from "../util/hooks.mjs";
import { registerItemHint } from "../util/item-hints.mjs";
import { localize } from "../util/localize.mjs";
import { registerSetting } from "../util/settings.mjs";
import { truthiness } from "../util/truthiness.mjs";

const key = 'martial-focus';
const compendiumId = 'W1eDSqiwljxDe0zl';

registerSetting({ key: key });

class Settings {
    static get martialFocus() { return Settings.#getSetting(key); }
    // @ts-ignore
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key).toLowerCase(); }
}

// register hint on feat
registerItemHint((hintcls, _actor, item, _data) => {
    const current = item.getItemDictionaryFlag(key);
    if (current) {
        return hintcls.create(pf1.config.weaponGroups[current] ?? current, [], {});
    }
});

// register hint on focused weapon/attack
registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemEquipmentPF || item instanceof pf1.documents.item.ItemAttackPF)) {
        return;
    }

    if (item instanceof pf1.documents.item.ItemEquipmentPF && !item.system.proficient || !item.system.weaponGroups) {
        return;
    }

    const weaponGroups = [...item.system.weaponGroups.value, ...item.system.weaponGroups.custom.split(';')].filter(truthiness);
    const focuses = new KeyedDFlagHelper(actor.itemFlags.dictionary, key).valuesForFlag(key);

    const isFocused = intersects(weaponGroups, focuses);

    if (isFocused) {
        return hintcls.create(localize(key), [], {});
    }
});

/**
 * @param {ActionUse} actionUse
 */
function addMartialFocus({ actor, item, shared }) {
    if (!(item instanceof pf1.documents.item.ItemEquipmentPF || item instanceof pf1.documents.item.ItemAttackPF)) {
        return;
    }
    if (item instanceof pf1.documents.item.ItemEquipmentPF && !item.system.proficient || !item.system.weaponGroups) {
        return;
    }
    if (!actor || !item.system.baseTypes?.length) return;

    const weaponGroups = [...item.system.weaponGroups.value, ...item.system.weaponGroups.custom.split(';')].filter(truthiness);
    const focuses = new KeyedDFlagHelper(actor.itemFlags.dictionary, key).valuesForFlag(key);

    const isFocused = intersects(weaponGroups, focuses);

    if (isFocused) {
        shared.damageBonus.push(`${1}[${localize(key)}]`);
    }
}
Hooks.on(localHooks.actionUseAlterRollData, addMartialFocus);

/**
 * Add Weapon Focus to tooltip
 * @param {ItemPF} item
 * @param {ModifierSource[]} sources
 * @returns {ModifierSource[]}
 */
function getAttackSources(item, sources) {
    const actor = item.actor;
    if (!actor) return sources;

    if (!(item instanceof pf1.documents.item.ItemEquipmentPF || item instanceof pf1.documents.item.ItemAttackPF)) {
        return sources;
    }

    const name = localize(key);

    const martialFocuses = getDocDFlags(actor, key);
    const groupsOnItem = [...(item.system.weaponGroups?.value || []), ...(item.system.weaponGroups?.custom || '').split(';')].filter(truthiness);
    const isFocused = intersects(groupsOnItem, martialFocuses);

    if (isFocused) {
        sources.push({ value: 1, name, modifier: 'untyped', sort: -100, });
        return sources.sort((a, b) => b.sort - a.sort);
    }

    return sources;
}
Hooks.on(localHooks.itemGetAttackSources, getAttackSources);

/**
 * @param {ItemAction} action
 * @param {ItemChange[]} sources
 */
function actionDamageSources({ item }, sources) {
    const actor = item.actor;
    if (!actor) return sources;

    if (!(item instanceof pf1.documents.item.ItemEquipmentPF || item instanceof pf1.documents.item.ItemAttackPF)) {
        return sources;
    }

    const name = localize(key);

    const martialFocuses = getDocDFlags(actor, key);
    const groupsOnItem = [...(item.system.weaponGroups?.value || []), ...(item.system.weaponGroups?.custom || '').split(';')].filter(truthiness);
    const isFocused = intersects(groupsOnItem, martialFocuses);

    if (isFocused) {
        const change = new pf1.components.ItemChange(
            {
                flavor: name,
                formula: 1,
                modifier: 'untypedPerm',
                operator: 'add',
                priority: 0,
                subTarget: 'damage',
                value: 1,
            }
        );
        return sources.push(change);
    }

    return sources;

};
Hooks.on(localHooks.actionDamageSources, actionDamageSources);

// this is a lot better, but it doesn't work because action.use doesn't read this data off of the roll data -- it re-looks it up itself.
// /**
//  * @param {ItemAction} action
//  * @param {RollData} rollData
//  */
// function getFocusedItemRollData(action, rollData) {
//     if (!(action instanceof pf1.components.ItemAction)) {
//         return;
//     }

//     const item = action.item;
//     if (!(item instanceof pf1.documents.item.ItemEquipmentPF) && !(item instanceof pf1.documents.item.ItemAttackPF)) {
//         return;
//     }

//     if ((item instanceof pf1.documents.item.ItemEquipmentPF && !item.system.proficient) || !item.system.weaponGroups) {
//         return;
//     }
//     const actor = action.actor;
//     if (!actor || !item.system.baseTypes?.length) return;

//     const weaponGroups = [...item.system.weaponGroups.value, ...item.system.weaponGroups.custom.split(';')].filter(truthiness);
//     const focuses = new KeyedDFlagHelper(actor.itemFlags.dictionary, key).valuesForFlag(key);

//     const isFocused = intersects(weaponGroups, focuses);

//     if (isFocused && rollData.action.damage?.parts?.length) {
//         rollData.action.damage.parts.push({
//             formula: `1[${localize(key)}]`,
//             type: rollData.action.damage.parts[0].type,
//         });
//     }
// }
// Hooks.on('pf1GetRollData', getFocusedItemRollData);

/**
 * @type {Handlebars.TemplateDelegate}
 */
let focusSelectorTemplate;
Hooks.once(
    'setup',
    async () => focusSelectorTemplate = await getTemplate(`modules/${MODULE_NAME}/hbs/labeled-key-value-dropdown-selector.hbs`)
);

Hooks.on('renderItemSheet', (
    /** @type {{}} */ _app,
    /** @type {[HTMLElement]} */[html],
    /** @type {{ item: ItemPF; }} */ { item },
) => {
    const name = item?.name?.toLowerCase() ?? '';

    if (!(name === Settings.martialFocus || item.system.flags.dictionary[key] !== undefined || item?.flags.core?.sourceId.includes(compendiumId))) {
        return;
    }

    const current = item.getItemDictionaryFlag(key);

    const customs = item.actor.items.filter(
        /** @returns {i is ItemEquipmentPF | ItemAttackPF} */
        (i) => i instanceof pf1.documents.item.ItemEquipmentPF || i instanceof pf1.documents.item.ItemAttackPF)
        .flatMap((i) => (i.system.weaponGroups?.custom ?? '').split(';'))
        .filter(truthiness)
        .map((i) => ({ key: i, label: i }));

    const groups = Object.entries(pf1.config.weaponGroups).map(([key, label]) => ({ key, label }));
    const choices = [...groups, ...customs].sort();

    if (choices.length && !current) {
        item.setItemDictionaryFlag(key, choices[0].key);
    }

    const templateData = { choices, current, label: localize(key), key };
    const div = document.createElement('div');
    div.innerHTML = focusSelectorTemplate(templateData, { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true });

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
