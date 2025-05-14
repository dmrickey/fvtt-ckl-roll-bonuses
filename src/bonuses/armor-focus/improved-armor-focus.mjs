// improved armor focus - https://www.d20pfsrd.com/feats/combat-feats/improved-armor-focus-combat/
// - ACP for chosen armor is decreased by one.

import { MODULE_NAME } from '../../consts.mjs';
import { stringSelect } from "../../handlebars-handlers/bonus-inputs/string-select.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { getCachedBonuses } from '../../util/get-cached-bonuses.mjs';
import { registerItemHint } from "../../util/item-hints.mjs";
import { localizeBonusLabel, localizeBonusTooltip } from "../../util/localize.mjs";
import { LanguageSettings } from '../../util/settings.mjs';
import { uniqueArray } from '../../util/unique-array.mjs';
import { SpecificBonus } from '../_specific-bonus.mjs';
import { ArmorFocus } from './armor-focus.mjs';

export class ArmorFocusImproved extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'armor-focus-improved'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#armor-focus'; }

    /** @inheritdoc @override */
    static get parent() { return ArmorFocus.key; }

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
            compendiumId: 'WmEE6BOuP5Uh7pEE',
            isItemMatchFunc: (name) => ArmorFocus.configuration.isItemMatchFunc(name) && name.includes(LanguageSettings.improved),
            showInputsFunc: (item, html, isEditable) => {
                const actor = item.actor;
                const choices = (isEditable && actor)
                    ? ArmorFocus.getFocusedArmor(actor)
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

                    const focused = ArmorFocus.getFocusedArmor(actor)[0] || '';
                    return { [this.key]: focused };
                }
            }
        };
    }

    /**
     * @param { ActorPF } actor
     * @returns {string[]}
     */
    static getImprovedFocusedArmor(actor) {
        return uniqueArray(getCachedBonuses(actor, this.key)
            .filter(x => x.hasItemBooleanFlag(this.key))
            .flatMap(x => x.getFlag(MODULE_NAME, this.key))
        );
    }
}

// register hint on source feat
registerItemHint((hintcls, _actor, item, _data) => {
    const has = item.hasItemBooleanFlag(ArmorFocusImproved.key);
    const current = item.getFlag(MODULE_NAME, ArmorFocusImproved.key);
    if (has && current) {
        return hintcls.create(`${current}`, [], { hint: localizeBonusTooltip(ArmorFocusImproved.key) });
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

    const armorFocuses = ArmorFocusImproved.getImprovedFocusedArmor(actor);
    if (!armorFocuses.length) return;

    const armor = actor.items.find(
        /** @returns {item is ItemEquipmentPF} */
        (item) => item instanceof pf1.documents.item.ItemEquipmentPF && item.isActive && item.system.slot === 'armor'
    );
    if (!armor) return;
    const baseTypes = armor.system.baseTypes;
    if (!baseTypes?.length) return;

    const isFocused = intersects(armorFocuses, baseTypes);
    if (isFocused) {
        const current = rollData.item.armor.acp || 0;
        const updated = Math.max(current - 1, 0);
        if (current !== updated) {
            rollData.item.armor.acp = updated;
            rollData.item.armor.total--;
        }
    }
}
Hooks.on('pf1GetRollData', handleArmorFocusRollData);

/**
 * @param {ActorPF} actor
 * @param {ItemChange[]} tempChanges
 */
function handleArmorFocusChange(actor, tempChanges) {
    const armorFocuses = ArmorFocusImproved.getImprovedFocusedArmor(actor);
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
                flavor: localizeBonusLabel(ArmorFocusImproved.key),
                formula: -1,
                type: "untypedPerm",
                target: "acpA",
            })
        );
    }
}
Hooks.on('pf1AddDefaultChanges', handleArmorFocusChange);
