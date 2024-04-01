// https://www.d20pfsrd.com/feats/combat-feats/martial-focus-combat/
// +1 damage to chosen weapon group with proficient weapon

import { MODULE_NAME } from "../consts.mjs";
import { keyValueSelect } from "../handlebars-handlers/bonus-inputs/key-value-select.mjs";
import { intersects } from "../util/array-intersects.mjs";
import { KeyedDFlagHelper, getDocDFlags } from "../util/flag-helpers.mjs";
import { customGlobalHooks } from "../util/hooks.mjs";
import { registerItemHint } from "../util/item-hints.mjs";
import { localizeBonusLabel } from "../util/localize.mjs";
import { registerSetting } from "../util/settings.mjs";
import { truthiness } from "../util/truthiness.mjs";
import { uniqueArray } from "../util/unique-array.mjs";
import { SpecificBonuses } from './all-specific-bonuses.mjs';

const key = 'martial-focus';
const compendiumId = 'W1eDSqiwljxDe0zl';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#martial-focus';

registerSetting({ key });

Hooks.once('ready', () => SpecificBonuses.registerSpecificBonus({ journal, key }));

class Settings {
    static get martialFocus() { return Settings.#getSetting(key); }
    // @ts-ignore
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key).toLowerCase(); }
}

// register hint on source feat
registerItemHint((hintcls, _actor, item, _data) => {
    const current = /** @type {keyof WeaponGroups} */ (item.getItemDictionaryFlag(key));
    if (current) {
        return hintcls.create(pf1.config.weaponGroups[current] ?? current, [], {});
    }
});

// register hint on focused weapon/attack
registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)) {
        return;
    }

    if (item instanceof pf1.documents.item.ItemWeaponPF && !item.system.proficient || !item.system.weaponGroups) {
        return;
    }

    const weaponGroups = [...item.system.weaponGroups.value, ...item.system.weaponGroups.custom.split(';')].map(x => x.trim()).filter(truthiness);
    const focuses = new KeyedDFlagHelper(actor, {}, key).valuesForFlag(key);

    const isFocused = intersects(weaponGroups, focuses);

    if (isFocused) {
        return hintcls.create(localizeBonusLabel(key), [], {});
    }
});

/**
 * @param {ActionUse} actionUse
 */
function addMartialFocus({ actor, item, shared }) {
    if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)) {
        return;
    }
    if (item instanceof pf1.documents.item.ItemWeaponPF && !item.system.proficient || !item.system.weaponGroups) {
        return;
    }
    if (!actor || !item.system.baseTypes?.length) return;

    const weaponGroups = [...item.system.weaponGroups.value, ...item.system.weaponGroups.custom.split(';')].map(x => x.trim()).filter(truthiness);
    const focuses = new KeyedDFlagHelper(actor, {}, key).valuesForFlag(key);

    const isFocused = intersects(weaponGroups, focuses);

    if (isFocused) {
        shared.damageBonus.push(`${1}[${localizeBonusLabel(key)}]`);
    }
}
Hooks.on(customGlobalHooks.actionUseAlterRollData, addMartialFocus);

/**
 * Add Martial Focus to damage tooltip
 *
 * @param {ItemAction} action
 * @param {ItemChange[]} sources
 */
function actionDamageSources({ item }, sources) {
    const actor = item.actor;
    if (!actor) return sources;

    if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)) {
        return sources;
    }

    const name = localizeBonusLabel(key);

    const martialFocuses = getDocDFlags(actor, key, { includeInactive: false });
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
Hooks.on(customGlobalHooks.actionDamageSources, actionDamageSources);

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
//             formula: `1[${localizeSpecificLabel(key)}]`,
//             type: rollData.action.damage.parts[0].type,
//         });
//     }
// }
// Hooks.on('pf1GetRollData', getFocusedItemRollData);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const name = item?.name?.toLowerCase() ?? '';
    const sourceId = item?.flags.core?.sourceId ?? '';
    if (!(name === Settings.martialFocus || item.system.flags.dictionary[key] !== undefined || sourceId.includes(compendiumId))) {
        return;
    }

    const current = item.getItemDictionaryFlag(key);

    const customs =
        !actor || !isEditable
            ? []
            : uniqueArray(
                actor.items
                    .filter(
                        /** @returns {i is ItemWeaponPF | ItemAttackPF} */
                        (i) => i instanceof pf1.documents.item.ItemWeaponPF || i instanceof pf1.documents.item.ItemAttackPF
                    )
                    .flatMap((i) => (i.system.weaponGroups?.custom ?? '').split(';'))
                    .filter(truthiness)
                ?? []
            ).map((i) => ({ key: i, label: i }));

    const groups = Object.entries(pf1.config.weaponGroups).map(([key, label]) => ({ key, label }));
    const choices = [...groups, ...customs].sort();

    keyValueSelect({
        choices,
        current,
        item,
        journal,
        key,
        parent: html
    }, {
        canEdit: !isEditable,
    });
});
