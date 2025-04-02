// https://www.d20pfsrd.com/feats/combat-feats/martial-focus-combat/
// +1 damage to chosen weapon group with proficient weapon

import { MODULE_NAME } from '../consts.mjs';
import { keyValueSelect } from "../handlebars-handlers/bonus-inputs/key-value-select.mjs";
import { intersects } from "../util/array-intersects.mjs";
import { createChangeForTooltip } from '../util/conditional-helpers.mjs';
import { getActorItemsByTypes } from '../util/get-actor-items-by-type.mjs';
import { getCachedBonuses } from '../util/get-cached-bonuses.mjs';
import { itemHasCompendiumId } from '../util/has-compendium-id.mjs';
import { customGlobalHooks } from "../util/hooks.mjs";
import { registerItemHint } from "../util/item-hints.mjs";
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../util/localize.mjs";
import { LanguageSettings } from "../util/settings.mjs";
import { truthiness } from "../util/truthiness.mjs";
import { uniqueArray } from "../util/unique-array.mjs";
import { SpecificBonuses } from './all-specific-bonuses.mjs';

const key = 'martial-focus';
const compendiumId = 'W1eDSqiwljxDe0zl';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#martial-focus';

SpecificBonuses.registerSpecificBonus({ journal, key });

class Settings {
    static get martialFocus() { return LanguageSettings.getTranslation(key); }

    static {
        LanguageSettings.registerItemNameTranslation(key);
    }
}

/**
 * @param {ActorPF} actor
 * @param {ItemPF} item
 * @returns {boolean}
 */
const isItemFocused = (actor, item) => {
    const weaponGroups = item.system.weaponGroups?.total ?? new Set();
    const focuses = getCachedBonuses(actor, key)
        .flatMap(x => x.getFlag(MODULE_NAME, key))
        .filter(truthiness);
    return intersects(weaponGroups, focuses);
}

/**
 * @param {ItemPF} item
 * @returns {ItemConditional | undefined}
 */
export function getMartialFocusCondtional(item) {
    const actor = item.actor;
    if (!actor || !item.system.weaponGroups) {
        return;
    }

    if (isItemFocused(actor, item)) {
        return new pf1.components.ItemConditional({
            _id: foundry.utils.randomID(),
            default: true,
            name: Settings.martialFocus,
            modifiers: [{
                _id: foundry.utils.randomID(),
                critical: 'normal',
                formula: '+1',
                subTarget: 'allDamage',
                target: 'damage',
                type: 'untyped',
            }],
        });
    }
}

// register hint on source feat
registerItemHint((hintcls, _actor, item, _data) => {
    const has = item.hasItemBooleanFlag(key);
    const current = /** @type {keyof WeaponGroups} */ (item.getFlag(MODULE_NAME, key));
    if (has && current) {
        return hintcls.create(pf1.config.weaponGroups[current] ?? current, [], { hint: localizeBonusTooltip(key) });
    }
});

// register hint on focused weapon/attack
registerItemHint((hintcls, actor, item, _data) => {
    if (!actor?.hasWeaponProficiency(item) || !item.system.weaponGroups) {
        return;
    }

    const isFocused = isItemFocused(actor, item);
    if (isFocused) {
        return hintcls.create(`+1 ${localize('PF1.Damage')}`, [], { hint: localizeBonusLabel(key) });
    }
});

/**
 * @param {ActionUse} actionUse
 */
function addMartialFocus({ actor, item, shared }) {
    if (!actor?.hasWeaponProficiency(item)
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
        const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
        if (isEditable && (name === Settings.martialFocus || hasCompendiumId)) {
            item.addItemBooleanFlag(key);
        }
        return;
    }

    const current = item.getFlag(MODULE_NAME, key);

    const customs =
        !actor || !isEditable
            ? []
            : uniqueArray(
                getActorItemsByTypes(actor, 'attack', 'weapon')
                    .flatMap((i) => ([...(i.system.weaponGroups?.custom ?? [])]))
                    .filter(truthiness)
            ).map((i) => ({ key: i, label: i }));

    const groups = Object.entries(pf1.config.weaponGroups).map(([key, label]) => ({ key, label }));
    const choices = [...groups, ...customs].sort((a, b) => a.label.localeCompare(b.label));

    keyValueSelect({
        choices,
        current,
        item,
        journal,
        key,
        parent: html
    }, {
        canEdit: isEditable,
        inputType: 'specific-bonus',
    });
});
