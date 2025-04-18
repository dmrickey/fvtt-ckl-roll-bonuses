// armor focus - https://www.d20pfsrd.com/feats/combat-feats/armor-focus-combat/
// - AC for chosen armor type is increased by one.

import { getFocusedArmor, getImprovedFocusedArmor, improvedArmorFocusKey, armorFocusKey as key } from "./shared.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../../util/localize.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { LanguageSettings } from "../../util/settings.mjs";
import { uniqueArray } from "../../util/unique-array.mjs";
import { stringSelect } from "../../handlebars-handlers/bonus-inputs/string-select.mjs";
import { SpecificBonuses } from '../_all-specific-bonuses.mjs';
import { MODULE_NAME } from '../../consts.mjs';
import { itemHasCompendiumId } from '../../util/has-compendium-id.mjs';

const compendiumId = 'zBrrZynIB0EXagds';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#armor-focus';

SpecificBonuses.registerSpecificBonus({ key, journal });

class Settings {
    static get armorFocus() { return LanguageSettings.getTranslation(key); }

    static {
        LanguageSettings.registerItemNameTranslation(key);
    }
}

// register hint on source feat
registerItemHint((hintcls, _actor, item, _data) => {
    const has = item.hasItemBooleanFlag(key);
    const current = item.getFlag(MODULE_NAME, key);
    if (has && current) {
        return hintcls.create(`${current}`, [], { hint: localizeBonusTooltip(key) });
    }
});

// register hint on focused item
registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemEquipmentPF)) return;

    const isArmor = item.isActive && item.system.slot === 'armor';
    const baseTypes = item.system.baseTypes;
    if (!baseTypes?.length) return;

    const armorFocuses = getFocusedArmor(actor);
    const improvedFocuses = getImprovedFocusedArmor(actor);
    const isFocused = intersects(armorFocuses, baseTypes);
    const isImprovedFocus = intersects(improvedFocuses, baseTypes);

    if (isArmor && isFocused) {
        const tips = [localizeBonusLabel(key), localize('ac-mod', { mod: '+1' })];
        if (isImprovedFocus) {
            tips.push('', localizeBonusLabel(improvedArmorFocusKey), localize('acp-mod', { mod: -1 }));
        }
        const hint = hintcls.create('', [], { icon: 'ra ra-helmet', hint: tips.join('\n') });
        return hint;
    }
});

/**
 * @param {ActorPF | ItemPF | ItemAction} doc
 * @param {RollData<SystemItemDataEquipmentPF>} rollData
 */
function handleArmorFocusRollData(doc, rollData) {
    if (!(doc instanceof pf1.documents.item.ItemEquipmentPF)) return;

    const actor = doc.actor;
    if (!actor) return;

    const armorFocuses = getFocusedArmor(actor);
    if (!armorFocuses.length) return;

    const armor = actor.items.find(
        /** @returns {item is ItemEquipmentPF} */
        (item) => item instanceof pf1.documents.item.ItemEquipmentPF && item.isActive && item.system.slot === 'armor');
    if (!armor) return;
    const baseTypes = armor.system.baseTypes;
    if (!baseTypes?.length) return;

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
    const armorFocuses = getFocusedArmor(actor);
    if (!armorFocuses.length) return;

    const armor = actor.items.find(
        /** @returns {item is ItemEquipmentPF} */
        (item) => item instanceof pf1.documents.item.ItemEquipmentPF && item.isActive && item.system.slot === 'armor'
    );
    if (!armor) return;
    const baseTypes = armor.system.baseTypes;
    if (!baseTypes?.length) return;

    const isFocused = intersects(armorFocuses, baseTypes);
    if (!isFocused) return;

    tempChanges.push(
        new pf1.components.ItemChange({
            flavor: localizeBonusLabel(key),
            formula: 1,
            type: "untypedPerm",
            target: "aac",
        })
    );
}
Hooks.on('pf1GetRollData', handleArmorFocusRollData);

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
        if (isEditable && (name === Settings.armorFocus || hasCompendiumId)) {
            item.addItemBooleanFlag(key);
        }
        return;
    }

    const choices = isEditable && actor
        ? uniqueArray(actor.items
            ?.filter(
                /** @returns {item is ItemEquipmentPF} */
                (item) => item.type === 'equipment'
                    && item instanceof pf1.documents.item.ItemEquipmentPF
                    && item.system.slot === 'armor')
            .flatMap((item) => item.system.baseTypes ?? []))
        : [];

    stringSelect({
        choices,
        item,
        journal,
        key,
        parent: html
    }, {
        canEdit: isEditable,
        inputType: 'specific-bonus',
    });
});

/**
 * @param {ItemPF} item
 * @param {object} data
 * @param {{temporary: boolean}} param2
 * @param {string} id
 */
const onCreate = (item, data, { temporary }, id) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;
    if (temporary) return;

    const name = item?.name?.toLowerCase() ?? '';
    const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
    const hasBonus = item.hasItemBooleanFlag(key);

    if (name.includes(LanguageSettings.improved)) {
        return;
    }

    let focused = '';
    if (item.actor) {
        focused = uniqueArray(item.actor.items
            ?.filter(
                /** @returns {item is ItemEquipmentPF} */
                (_item) => _item.type === 'equipment'
                    && _item instanceof pf1.documents.item.ItemEquipmentPF
                    && _item.system.slot === 'armor')
            .flatMap((_item) => _item.system.baseTypes ?? []))[0] || '';
    }

    let updated = false;
    if ((name === Settings.armorFocus || hasCompendiumId) && !hasBonus) {
        item.updateSource({
            [`system.flags.boolean.${key}`]: true,
        });
        updated = true;
    }
    if ((hasBonus || updated) && focused && !item.flags[MODULE_NAME]?.[key]) {
        item.updateSource({
            [`flags.${MODULE_NAME}.${key}`]: focused,
        });
    }
};
Hooks.on('preCreateItem', onCreate);
