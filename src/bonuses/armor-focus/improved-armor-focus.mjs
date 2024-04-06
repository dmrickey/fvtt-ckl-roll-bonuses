// improved armor focus - https://www.d20pfsrd.com/feats/combat-feats/improved-armor-focus-combat/
// - ACP for chosen armor is decreased by one.

import { MODULE_NAME } from "../../consts.mjs";
import { stringSelect } from "../../handlebars-handlers/bonus-inputs/string-select.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { KeyedDFlagHelper, getDocDFlags } from "../../util/flag-helpers.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localizeBonusLabel } from "../../util/localize.mjs";
import { registerSetting } from "../../util/settings.mjs";
import { uniqueArray } from '../../util/unique-array.mjs';
import { SpecificBonuses } from '../all-specific-bonuses.mjs';
import { armorFocusKey } from "./ids.mjs";

const key = 'improved-armor-focus';
const compendiumId = 'WmEE6BOuP5Uh7pEE';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#armor-focus';

export { key as improvedArmorFocusKey };

Hooks.once('ready', () => SpecificBonuses.registerSpecificBonus({ journal, key, parent: armorFocusKey }));

class Settings {
    static get armorFocus() { return Settings.#getSetting(armorFocusKey); }
    static get improved() { return Settings.#getSetting(key); }
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
        const current = rollData.item.armor.acp || 0;
        rollData.item.armor.acp = Math.max(current - 1, 0);
    }
}
Hooks.on('pf1GetRollData', handleArmorFocusRollData);

/**
 * @param {ActorPF} actor
 * @param {ItemChange[]} tempChanges
 */
function handleArmorFocusChange(actor, tempChanges) {
    const armorFocuses = new KeyedDFlagHelper(actor, {}, key).valuesForFlag(key);
    if (!armorFocuses.length) return;

    const armor =
        actor.items.find(
            /** @returns {item is ItemEquipmentPF}} */
            (item) => item instanceof pf1.documents.item.ItemEquipmentPF && item.isActive && item.system.slot === 'armor');
    if (!armor) return;
    const baseTypes = armor.system.baseTypes;
    if (!baseTypes?.length) return;

    const isFocused = intersects(armorFocuses, baseTypes);
    if (!isFocused) return;

    const current = armor.system.armor.acp || 0;
    if (current > 0) {
        tempChanges.push(
            new pf1.components.ItemChange({
                flavor: localizeBonusLabel(key),
                formula: -1,
                modifier: "untypedPerm",
                subTarget: "acpA",
            })
        );
    }
}
Hooks.on('pf1AddDefaultChanges', handleArmorFocusChange);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const name = item?.name?.toLowerCase() ?? '';
    const sourceId = item?.flags.core?.sourceId ?? '';
    if (!((name.includes(Settings.armorFocus) && name.includes(Settings.improved))
        || item.system.flags.dictionary[key] !== undefined
        || sourceId.includes(compendiumId))
    ) {
        return;
    }

    const current = item.getItemDictionaryFlag(key);
    const choices = isEditable
        ? uniqueArray(getDocDFlags(actor, armorFocusKey).map(x => `${x}`))
        : [];

    stringSelect({
        choices,
        current,
        item,
        journal,
        key,
        parent: html
    }, {
        canEdit: isEditable
    });
});
