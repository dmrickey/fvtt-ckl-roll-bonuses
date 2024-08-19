// https://www.d20pfsrd.com/feats/combat-feats/weapon-specialization-combat/
// +2 damage on selected weapon type - requires Weapon Focus with selected weapon

import { MODULE_NAME } from '../../consts.mjs';
import { stringSelect } from "../../handlebars-handlers/bonus-inputs/string-select.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { createChangeForTooltip } from '../../util/conditional-helpers.mjs';
import { LocalHookHandler, customGlobalHooks, localHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize, localizeBonusLabel } from "../../util/localize.mjs";
import { SharedSettings, LanguageSettings } from "../../util/settings.mjs";
import { uniqueArray } from "../../util/unique-array.mjs";
import { SpecificBonuses } from '../all-specific-bonuses.mjs';
import { getFocusedWeapons } from '../weapon-focus/weapon-focus.mjs';

const key = 'weapon-specialization';
export { key as weaponSpecializationKey };
const compendiumId = 'YLCvMNeAF9V31m1h';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#weapon-specialization';

Hooks.once('ready', () => SpecificBonuses.registerSpecificBonus({ journal, key }));

class Settings {
    static get weaponSpecialization() { return LanguageSettings.getTranslation(key); }

    static {
        LanguageSettings.registerItemNameTranslation(key);
    }
}
export { Settings as WeaponSpecializationSettings }

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
 * @param { ActorPF } actor
 * @returns {string[]}
 */
export const getSpecializedWeapons = (actor) =>
    uniqueArray(actor?.[MODULE_NAME][key]?.
        filter(x => x.hasItemBooleanFlag(key))
        .flatMap(x => x.getFlag(MODULE_NAME, key))
        ?? []
    );

// register hint on source feat
registerItemHint((hintcls, _actor, item, _data) => {
    const current = item.getFlag(MODULE_NAME, key);
    if (current) {
        return hintcls.create(`${current}`, [], {});
    }
});

// register hint on focused weapon/attack
registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)
        || !actor?.hasWeaponProficiency(item)
    ) {
        return;
    }

    const baseTypes = item.system.baseTypes;
    const specializations = getSpecializedWeapons(actor);
    if (intersects(baseTypes, specializations)) {
        return hintcls.create(`+2 ${localize('PF1.Damage')}`, [], { hint: localizeBonusLabel(key) });
    }
});

/**
 * @param {ActionUse} actionUse
 */
function addWeaponSpecialization({ actor, item, shared }) {
    if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)
        || !actor
        || !item.system.baseTypes?.length
    ) {
        return;
    }

    const baseTypes = item.system.baseTypes;
    const specializations = getSpecializedWeapons(actor);
    if (intersects(baseTypes, specializations)) {
        shared.damageBonus.push(`${2}[${localizeBonusLabel(key)}]`);
    }
}
Hooks.on(customGlobalHooks.actionUseAlterRollData, addWeaponSpecialization);

/**
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

    const baseTypes = item.system.baseTypes;
    const specializations = getSpecializedWeapons(actor);
    if (intersects(baseTypes, specializations)) {
        const name = localizeBonusLabel(key);
        const change = createChangeForTooltip({ name, value: 2 });
        sources.push(change);
    }

    return sources;
};
Hooks.on(customGlobalHooks.getDamageTooltipSources, getDamageTooltipSources);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (SharedSettings.elephantInTheRoom) return;
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const name = item?.name?.toLowerCase() ?? '';
    const sourceId = item?.flags.core?.sourceId ?? '';
    if (
        !(name === Settings.weaponSpecialization || item.system.flags.dictionary[key] !== undefined || sourceId.includes(compendiumId))) {
        return;
    }

    const choices = actor && isEditable
        ? getFocusedWeapons(actor)
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
