// https://www.d20pfsrd.com/feats/combat-feats/martial-focus-combat/
// +1 damage to chosen weapon group with proficient weapon

import { MODULE_NAME } from '../consts.mjs';
import { keyValueSelect } from "../handlebars-handlers/bonus-inputs/key-value-select.mjs";
import { intersects } from "../util/array-intersects.mjs";
import { createChangeForTooltip } from '../util/conditional-helpers.mjs';
import { LocalHookHandler, customGlobalHooks, localHooks } from "../util/hooks.mjs";
import { registerItemHint } from "../util/item-hints.mjs";
import { localizeBonusLabel } from "../util/localize.mjs";
import { LanguageSettings } from "../util/settings.mjs";
import { truthiness } from "../util/truthiness.mjs";
import { uniqueArray } from "../util/unique-array.mjs";
import { SpecificBonuses } from './all-specific-bonuses.mjs';

const key = 'martial-focus';
const compendiumId = 'W1eDSqiwljxDe0zl';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#martial-focus';

Hooks.once('ready', () => SpecificBonuses.registerSpecificBonus({ journal, key, type: 'boolean' }));

class Settings {
    static get martialFocus() { return LanguageSettings.getTranslation(key); }

    static {
        LanguageSettings.registerItemNameTranslation(key);
    }
}

/**
 * @param {ItemPF} item
 * @param {RollData} _rollData
 */
function prepareData(item, _rollData) {
    if (!item?.actor || !item.isActive) return;

    if (item.hasItemBooleanFlag(key)) {
        item.actor[MODULE_NAME][key] ||= [];
        item.actor[MODULE_NAME][key].push(item);
    }
}
LocalHookHandler.registerHandler(localHooks.prepareData, prepareData);

/**
 * @param {ActorPF} actor
 * @param {ItemAttackPF | ItemWeaponPF} item
 * @returns {boolean}
 */
const isItemFocused = (actor, item) => {
    const weaponGroups = [...item.system.weaponGroups.value, ...item.system.weaponGroups.custom].map(x => x.trim()).filter(truthiness);
    const focuses = (actor[MODULE_NAME][key] || [])
        .flatMap(x => x.getFlag(MODULE_NAME, key))
        .filter(truthiness);
    return intersects(weaponGroups, focuses);
}

// register hint on source feat
registerItemHint((hintcls, _actor, item, _data) => {
    const current = /** @type {keyof WeaponGroups} */ (item.getFlag(MODULE_NAME, key));
    if (current) {
        return hintcls.create(pf1.config.weaponGroups[current] ?? current, [], {});
    }
});

// register hint on focused weapon/attack
registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)
        || !actor?.hasWeaponProficiency(item) || !item.system.weaponGroups) {
        return;
    }

    const isFocused = isItemFocused(actor, item);
    if (isFocused) {
        return hintcls.create(localizeBonusLabel(key), [], {});
    }
});

/**
 * @param {ActionUse} actionUse
 */
function addMartialFocus({ actor, item, shared }) {
    if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)
        || !actor?.hasWeaponProficiency(item)
        || !item.system.weaponGroups
    ) {
        return;
    }

    const isFocused = isItemFocused(actor, item);
    if (isFocused) {
        shared.damageBonus.push(`${1}[${localizeBonusLabel(key)}]`);
    }
}
Hooks.on(customGlobalHooks.actionUseAlterRollData, addMartialFocus);

/**
 * Add Martial Focus to damage tooltip
 *
 * @param {ItemPF} item
 * @param {ItemChange[]} sources
 */
function getDamageTooltipSources(item, sources) {
    const actor = item.actor;
    if (!actor
        || !(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)
    ) {
        return sources;
    }

    const isFocused = isItemFocused(actor, item);
    if (isFocused) {
        const name = localizeBonusLabel(key);
        const change = createChangeForTooltip({ name, value: 1 });
        return sources.push(change);
    }

    return sources;

};
Hooks.on(customGlobalHooks.getDamageTooltipSources, getDamageTooltipSources);

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

//     if (!actor?.hasWeaponProficiency(item) || !item.system.weaponGroups) {
//         return;
//     }
//     const actor = action.actor;
//     if (!actor || !item.system.baseTypes?.length) return;

//     const weaponGroups = [...item.system.weaponGroups.value, ...item.system.weaponGroups.custom].map(x => x.trim()).filter(truthiness);
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

    const hasKey = item.hasItemBooleanFlag(key);
    if (!hasKey) {
        const name = item?.name?.toLowerCase() ?? '';
        const sourceId = item?.flags.core?.sourceId ?? '';
        if (name === Settings.martialFocus || sourceId.includes(compendiumId)) {
            item.addItemBooleanFlag(key);
        }
        return;
    }

    const current = item.getFlag(MODULE_NAME, key);

    const customs =
        !actor || !isEditable
            ? []
            : uniqueArray(
                actor.items
                    .filter(
                        /** @returns {i is ItemWeaponPF | ItemAttackPF} */
                        (i) => i instanceof pf1.documents.item.ItemWeaponPF || i instanceof pf1.documents.item.ItemAttackPF
                    )
                    .flatMap((i) => (i.system.weaponGroups?.custom ?? []))
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
        canEdit: isEditable,
    });
});
