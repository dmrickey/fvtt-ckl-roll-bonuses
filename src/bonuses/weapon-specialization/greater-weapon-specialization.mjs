// https://www.d20pfsrd.com/feats/combat-feats/weapon-specialization-combat/
// +2 damage on selected weapon type - requires Greater Weapon Focus and Weapon Specialization with selected weapon

import { MODULE_NAME } from "../../consts.mjs";
import { addNodeToRollBonus } from "../../roll-bonus-on-actor-sheet.mjs";
import { intersection, intersects } from "../../util/array-intersects.mjs";
import { KeyedDFlagHelper, getDocDFlags } from "../../util/flag-helpers.mjs";
import { localHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize } from "../../util/localize.mjs";
import { registerSetting } from "../../util/settings.mjs";
import { greaterWeaponFocusKey } from "../weapon-focus/ids.mjs";
import { WeaponSpecializationSettings, weaponSpecializationKey } from "./weapon-specialization.mjs";

const key = 'greater-weapon-specialization';
const compendiumId = 'asmQDyDYTtuXg8b4';

registerSetting({ key: key });

class Settings {
    static get weaponSpecialization() { return Settings.#getSetting(key); }
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

// register hint on focused weapon/attack
registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)) {
        return;
    }

    if (item instanceof pf1.documents.item.ItemWeaponPF && !item.system.proficient) {
        return;
    }

    const baseTypes = item.system.baseTypes;
    const helper = new KeyedDFlagHelper(actor, key);

    if (intersects(baseTypes, helper.valuesForFlag(key))) {
        return hintcls.create(`+2 ${localize('PF1.Damage')}`, [], { hint: localize(key) });
    }
});


/**
 * @param {ActionUse} actionUse
 */
function addWeaponSpecialization({ actor, item, shared }) {
    if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)) {
        return;
    }
    if (!actor || !item.system.baseTypes?.length) return;

    const baseTypes = item.system.baseTypes;

    const helper = new KeyedDFlagHelper(actor, key);
    if (intersects(baseTypes, helper.valuesForFlag(key))) {
        shared.damageBonus.push(`${2}[${localize(key)}]`);
    }
}
Hooks.on(localHooks.actionUseAlterRollData, addWeaponSpecialization);

/**
 * @param {ItemAction} action
 * @param {ItemChange[]} sources
 */
function actionDamageSources({ item }, sources) {
    const actor = item.actor;
    if (!actor) return sources;

    if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)) {
        return sources;
    }

    const name = localize(key);

    const weaponSpecializationes = getDocDFlags(actor, key);
    const baseTypes = item.system.baseTypes;
    const isFocused = intersects(baseTypes, weaponSpecializationes);

    if (isFocused) {
        const change = new pf1.components.ItemChange(
            {
                flavor: name,
                formula: 2,
                modifier: 'untypedPerm',
                operator: 'add',
                priority: 0,
                subTarget: 'damage',
                value: 2,
            }
        );
        return sources.push(change);
    }

    return sources;

};
Hooks.on(localHooks.actionDamageSources, actionDamageSources);

// todo - update for weapon spec.
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
//     if (!(item instanceof pf1.documents.item.ItemWeaponPF) && !(item instanceof pf1.documents.item.ItemAttackPF)) {
//         return;
//     }

//     if ((item instanceof pf1.documents.item.ItemWeaponPF && !item.system.proficient) || !item.system.weaponGroups) {
//         return;
//     }
//     const actor = action.actor;
//     if (!actor || !item.system.baseTypes?.length) return;

//     const weaponGroups = [...item.system.weaponGroups.value, ...item.system.weaponGroups.custom.split(';')].filter(truthiness);
//     const focuses = new KeyedDFlagHelper(actor, key).valuesForFlag(key);

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
    async () => focusSelectorTemplate = await getTemplate(`modules/${MODULE_NAME}/hbs/labeled-string-dropdown-selector.hbs`)
);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    const name = item?.name?.toLowerCase() ?? '';
    const sourceId = item?.flags.core?.sourceId ?? '';
    if (!((name.includes(WeaponSpecializationSettings.weaponSpecialization) && name.includes(Settings.weaponSpecialization))
        || item.system.flags.dictionary[key] !== undefined
        || sourceId.includes(compendiumId))
    ) {
        return;
    }

    const current = item.getItemDictionaryFlag(key);

    const helper = new KeyedDFlagHelper(actor, greaterWeaponFocusKey, weaponSpecializationKey);
    const focuses = helper.valuesForFlag(greaterWeaponFocusKey);
    const specs = helper.valuesForFlag(weaponSpecializationKey);
    const choices = intersection(focuses, specs).sort();

    if (choices.length && !current) {
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
