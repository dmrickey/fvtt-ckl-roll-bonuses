// https://www.d20pfsrd.com/feats/combat-feats/weapon-specialization-combat/
// +2 damage on selected weapon type - requires Weapon Focus with selected weapon

import { MODULE_NAME } from "../../consts.mjs";
import { stringSelect } from "../../handlebars-handlers/bonus-inputs/string-select.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { KeyedDFlagHelper, getDocDFlags } from "../../util/flag-helpers.mjs";
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize } from "../../util/localize.mjs";
import { registerSetting } from "../../util/settings.mjs";
import { uniqueArray } from "../../util/unique-array.mjs";
import { SpecificBonuses } from '../all-specific-bonuses.mjs';
import { weaponFocusKey } from "../weapon-focus/ids.mjs";

const key = 'weapon-specialization';
export { key as weaponSpecializationKey };
const compendiumId = 'YLCvMNeAF9V31m1h';

registerSetting({ key });

Hooks.once('ready', () => SpecificBonuses.registerSpecificBonus({ key }));

class Settings {
    static get weaponSpecialization() { return Settings.#getSetting(key); }
    // @ts-ignore
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key).toLowerCase(); }
}
export { Settings as WeaponSpecializationSettings }

// register hint on source feat
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
    const helper = new KeyedDFlagHelper(actor, {}, key);

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

    const helper = new KeyedDFlagHelper(actor, {}, key);
    if (intersects(baseTypes, helper.valuesForFlag(key))) {
        shared.damageBonus.push(`${2}[${localize(key)}]`);
    }
}
Hooks.on(customGlobalHooks.actionUseAlterRollData, addWeaponSpecialization);

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

    const weaponSpecializationes = getDocDFlags(actor, key, { includeInactive: false });
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
        sources.push(change);
    }

    return sources;

};
Hooks.on(customGlobalHooks.actionDamageSources, actionDamageSources);

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

//     const weaponGroups = [...item.system.weaponGroups.value, ...item.system.weaponGroups.custom.split(';')].map(x => x.trim()).filter(truthiness);
//     const focuses = new KeyedDFlagHelper(actor, {}, key).valuesForFlag(key);

//     const isFocused = intersects(weaponGroups, focuses);

//     if (isFocused && rollData.action.damage?.parts?.length) {
//         rollData.action.damage.parts.push({
//             formula: `1[${localize(key)}]`,
//             type: rollData.action.damage.parts[0].type,
//         });
//     }
// }
// Hooks.on('pf1GetRollData', getFocusedItemRollData);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const name = item?.name?.toLowerCase() ?? '';
    const sourceId = item?.flags.core?.sourceId ?? '';
    if (!(name === Settings.weaponSpecialization || item.system.flags.dictionary[key] !== undefined || sourceId.includes(compendiumId))) {
        return;
    }

    if (!actor) {
        return;
    }

    const current = item.getItemDictionaryFlag(key);

    const choices = uniqueArray(new KeyedDFlagHelper(actor, {}, weaponFocusKey).valuesForFlag(weaponFocusKey))
        .map(x => '' + x)
        .sort();

    stringSelect({
        choices,
        current,
        item,
        key,
        label: localize(key),
        parent: html
    });
});
