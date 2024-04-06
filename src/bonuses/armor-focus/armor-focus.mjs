// armor focus - https://www.d20pfsrd.com/feats/combat-feats/armor-focus-combat/
// - AC for chosen armor type is increased by one.

import { armorFocusKey as key } from "./ids.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { KeyedDFlagHelper } from "../../util/flag-helpers.mjs";
import { localize, localizeBonusLabel } from "../../util/localize.mjs";
import { MODULE_NAME } from "../../consts.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { registerSetting } from "../../util/settings.mjs";
import { uniqueArray } from "../../util/unique-array.mjs";
import { stringSelect } from "../../handlebars-handlers/bonus-inputs/string-select.mjs";
import { improvedArmorFocusKey } from './improved-armor-focus.mjs';
import { SpecificBonuses } from '../all-specific-bonuses.mjs';

const compendiumId = 'zBrrZynIB0EXagds';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#armor-focus';

Hooks.once('ready', () => SpecificBonuses.registerSpecificBonus({ key, journal }));

class Settings {
    static get armorFocus() { return Settings.#getSetting(key); }
    // @ts-ignore
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key).toLowerCase(); }

    static {
        registerSetting({ key });
    }
}

// register hint on source feat
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

    const helper = new KeyedDFlagHelper(actor, {}, key, improvedArmorFocusKey);
    const armorFocuses = helper.valuesForFlag(key);
    const improvedFocuses = helper.valuesForFlag(improvedArmorFocusKey);
    const isFocused = intersects(armorFocuses, baseTypes);
    const isImprovedFocus = intersects(improvedFocuses, baseTypes);

    if (isArmor && isFocused) {
        const tips = [localizeBonusLabel(key), localize('ac-mod', { mod: '+1' })];
        if (isImprovedFocus) {
            tips.push('', localizeBonusLabel(improvedArmorFocusKey), localize('acp-mod', { mod: -1 }));
        }
        const hint = hintcls.create('', [], { icon: 'fas fa-helmet-battle', hint: tips.join('\n') });
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

    const armor = actor.items.find(
        /** @returns {item is ItemEquipmentPF} */
        (item) => item instanceof pf1.documents.item.ItemEquipmentPF && item.isActive && item.system.slot === 'armor');
    if (!armor) return;
    const baseTypes = armor.system.baseTypes;
    if (!baseTypes?.length) return;

    const armorFocuses = new KeyedDFlagHelper(actor, {}, key).valuesForFlag(key);
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
    const armorFocuses = new KeyedDFlagHelper(actor, {}, key).valuesForFlag(key);
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
            flavor: localizeBonusLabel(key),
            formula: 1,
            modifier: "untypedPerm",
            subTarget: "aac",
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

    const name = item?.name?.toLowerCase() ?? '';
    const sourceId = item?.flags.core?.sourceId ?? '';
    if (!(name === Settings.armorFocus || item.system.flags.dictionary[key] !== undefined || sourceId.includes(compendiumId))) {
        return;
    }

    const current = item.getItemDictionaryFlag(key);
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
        current,
        item,
        journal,
        key,
        parent: html
    }, {
        canEdit: isEditable,
    });
});
