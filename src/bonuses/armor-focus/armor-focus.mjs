// armor focus - https://www.d20pfsrd.com/feats/combat-feats/armor-focus-combat/
// - AC for chosen armor type is increased by one.

import { MODULE_NAME } from '../../consts.mjs';
import { stringSelect } from "../../handlebars-handlers/bonus-inputs/string-select.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { getCachedBonuses } from '../../util/get-cached-bonuses.mjs';
import { registerItemHint } from "../../util/item-hints.mjs";
import { localizeBonusLabel, localizeBonusTooltip } from "../../util/localize.mjs";
import { LanguageSettings } from "../../util/settings.mjs";
import { uniqueArray } from "../../util/unique-array.mjs";
import { SpecificBonus } from '../_specific-bonus.mjs';

export class ArmorFocus extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'armor-focus'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#armor-focus'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {string} armorType
     * @returns {Promise<void>}
     */
    static async configure(item, armorType) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: { [MODULE_NAME]: { [this.key]: armorType } },
        });
    }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'zBrrZynIB0EXagds',
            isItemMatchFunc: (name) => name === Settings.armorFocus,
            showInputsFunc: (item, html, isEditable) => {
                const actor = item.actor;
                const choices = (isEditable && actor)
                    ? uniqueArray(actor.itemTypes.equipment
                        ?.filter((item) => item.system.slot === 'armor')
                        .flatMap((item) => item.system.baseTypes ?? []))
                    : [];

                stringSelect({
                    choices,
                    item,
                    journal: this.journal,
                    key: this.key,
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

    /**
     * @param { ActorPF } actor
     * @returns {string[]}
     */
    static getFocusedArmor(actor) {
        return uniqueArray(getCachedBonuses(actor, this.key)
            .filter(x => x.hasItemBooleanFlag(this.key))
            .flatMap(x => x.getFlag(MODULE_NAME, this.key))
        );
    }
}

class Settings {
    static get armorFocus() { return LanguageSettings.getTranslation(ArmorFocus.key); }

    static {
        LanguageSettings.registerItemNameTranslation(ArmorFocus.key);
    }
}

// register hint on source feat
registerItemHint((hintcls, _actor, item, _data) => {
    const has = item.hasItemBooleanFlag(ArmorFocus.key);
    const current = item.getFlag(MODULE_NAME, ArmorFocus.key);
    if (has && current) {
        return hintcls.create(`${current}`, [], { hint: localizeBonusTooltip(ArmorFocus.key) });
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

    const armorFocuses = ArmorFocus.getFocusedArmor(actor);
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
Hooks.on('pf1GetRollData', handleArmorFocusRollData);

/**
 * @param {ActorPF} actor
 * @param {ItemChange[]} tempChanges
 */
function handleArmorFocusChange(actor, tempChanges) {
    const armorFocuses = ArmorFocus.getFocusedArmor(actor);
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
            flavor: localizeBonusLabel(ArmorFocus.key),
            formula: 1,
            type: "untypedPerm",
            target: "aac",
        })
    );
}
Hooks.on('pf1AddDefaultChanges', handleArmorFocusChange);
