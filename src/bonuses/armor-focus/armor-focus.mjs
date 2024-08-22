// armor focus - https://www.d20pfsrd.com/feats/combat-feats/armor-focus-combat/
// - AC for chosen armor type is increased by one.

import { getFocusedArmor, getImprovedFocusedArmor, improvedArmorFocusKey, armorFocusKey as key } from "./shared.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { localize, localizeBonusLabel } from "../../util/localize.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { LanguageSettings } from "../../util/settings.mjs";
import { uniqueArray } from "../../util/unique-array.mjs";
import { stringSelect } from "../../handlebars-handlers/bonus-inputs/string-select.mjs";
import { SpecificBonuses } from '../all-specific-bonuses.mjs';
import { MODULE_NAME } from '../../consts.mjs';
import { LocalHookHandler, localHooks } from '../../util/hooks.mjs';

const compendiumId = 'zBrrZynIB0EXagds';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#armor-focus';

Hooks.once('ready', () => SpecificBonuses.registerSpecificBonus({ key, journal }));

class Settings {
    static get armorFocus() { return LanguageSettings.getTranslation(key); }

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

    const armor = actor.items.find(
        /** @returns {item is ItemEquipmentPF} */
        (item) => item instanceof pf1.documents.item.ItemEquipmentPF && item.isActive && item.system.slot === 'armor');
    if (!armor) return;
    const baseTypes = armor.system.baseTypes;
    if (!baseTypes?.length) return;

    const armorFocuses = getFocusedArmor(actor);
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
        const sourceId = item?.flags.core?.sourceId ?? '';
        if (name === Settings.armorFocus || sourceId.includes(compendiumId)) {
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
    });
});
