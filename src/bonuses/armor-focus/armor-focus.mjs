// armor focus - https://www.d20pfsrd.com/feats/combat-feats/armor-focus-combat/
// - AC for chosen armor type is increased by one.

import { MODULE_NAME } from '../../consts.mjs';
import { stringSelect } from "../../handlebars-handlers/bonus-inputs/string-select.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../../util/localize.mjs";
import { LanguageSettings } from "../../util/settings.mjs";
import { uniqueArray } from "../../util/unique-array.mjs";
import { SpecificBonus } from '../_specific-bonus.mjs';
import { getFocusedArmor, getImprovedFocusedArmor, improvedArmorFocusKey, armorFocusKey as key } from "./shared.mjs";

export class ArmorFocus extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return key; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#armor-focus'; }

    /** @inheritdoc @override @returns {RenderAndCreateConfigure} */
    static get configuration() {
        return {
            type: 'render-and-create-configure',
            itemFilter: (item) => item instanceof pf1.documents.item.ItemPF,
            compendiumId: 'zBrrZynIB0EXagds',
            isItemMatchFunc: (name) => name === Settings.armorFocus,
            showInputsFunc: (item, html, isEditable) => {
                const actor = item.actor;
                const choices = isEditable && actor
                    ? uniqueArray(actor.itemTypes.equipment
                        ?.filter((item) => item.system.slot === 'armor')
                        .flatMap((item) => item.system.baseTypes ?? []))
                    : [];

                stringSelect({
                    choices,
                    item,
                    journal: this.journal,
                    key,
                    parent: html
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
            options: {
                defaultFlagValuesFunc: (item) => {
                    const actor = item?.actor;
                    if (!actor) return;

                    const choices = uniqueArray(actor.itemTypes.equipment
                        ?.filter((item) => item.system.slot === 'armor')
                        .flatMap((item) => item.system.baseTypes ?? []));
                    if (choices.length) {
                        return { [this.key]: choices[0] };
                    }
                }
            }
        };
    }
}

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
