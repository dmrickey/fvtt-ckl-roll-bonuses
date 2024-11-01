// https://www.d20pfsrd.com/feats/combat-feats/weapon-specialization-combat/
// +2 damage on selected weapon type - requires Weapon Focus with selected weapon

import { MODULE_NAME } from '../../consts.mjs';
import { stringSelect } from "../../handlebars-handlers/bonus-inputs/string-select.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { createChangeForTooltip } from '../../util/conditional-helpers.mjs';
import { getCachedBonuses } from '../../util/get-cached-bonuses.mjs';
import { customGlobalHooks } from "../../util/hooks.mjs";
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

SpecificBonuses.registerSpecificBonus({ journal, key });

class Settings {
    static get weaponSpecialization() { return LanguageSettings.getTranslation(key); }

    static {
        LanguageSettings.registerItemNameTranslation(key);
    }
}
export { Settings as WeaponSpecializationSettings }

/**
 * @param { ActorPF } actor
 * @returns {string[]}
 */
export const getSpecializedWeapons = (actor) =>
    uniqueArray(getCachedBonuses(actor, key)
        .filter(x => x.hasItemBooleanFlag(key))
        .flatMap(x => x.getFlag(MODULE_NAME, key))
    );

// register hint on source feat
registerItemHint((hintcls, _actor, item, _data) => {
    const has = item.hasItemBooleanFlag(key);
    const current = item.getFlag(MODULE_NAME, key);
    if (has && current) {
        return hintcls.create(`${current}`, [], {});
    }
});

// register hint on focused weapon/attack
registerItemHint((hintcls, actor, item, _data) => {
    if (!item.system.baseTypes || !actor?.hasWeaponProficiency(item)) {
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
    if (!actor || !item.system.baseTypes?.length) {
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
 * @returns {ItemConditional | undefined}
 */
export function getWeaponSpecializaitonConditional(item) {
    const actor = item.actor;
    if (!actor || !item.system.baseTypes?.length) {
        return;
    }

    const baseTypes = item.system.baseTypes;
    const specializations = getSpecializedWeapons(actor);
    if (intersects(baseTypes, specializations)) {
        return new pf1.components.ItemConditional({
            _id: foundry.utils.randomID(),
            default: true,
            name: Settings.weaponSpecialization,
            modifiers: [{
                ...pf1.components.ItemConditionalModifier.defaultData,
                _id: foundry.utils.randomID(),
                critical: 'normal',
                formula: '+2',
                subTarget: 'allDamage',
                target: 'damage',
                type: 'untyped',
            }],
        });
    }
}

/**
 * @param {ItemPF} item
 * @param {ItemChange[]} sources
 */
function getDamageTooltipSources(item, sources) {
    const actor = item.actor;
    if (!actor || !item.system.baseTypes?.length) {
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

    const hasKey = item.hasItemBooleanFlag(key);
    if (!hasKey) {
        const name = item?.name?.toLowerCase() ?? '';
        const sourceId = item?.flags.core?.sourceId ?? '';
        if (isEditable && (name === Settings.weaponSpecialization || sourceId.includes(compendiumId))) {
            item.addItemBooleanFlag(key);
        }
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
    const sourceId = item?.flags.core?.sourceId ?? '';
    const hasBonus = item.hasItemBooleanFlag(key);

    let choice = '';
    if (item.actor) {
        choice = getFocusedWeapons(item.actor)[0] || '';
    }

    let updated = false;
    if ((name === Settings.weaponSpecialization || sourceId.includes(compendiumId)) && !hasBonus) {
        item.updateSource({
            [`system.flags.boolean.${key}`]: true,
        });
        updated = true;
    }
    if ((hasBonus || updated) && choice && !item.flags[MODULE_NAME]?.[key]) {
        item.updateSource({
            [`flags.${MODULE_NAME}.${key}`]: choice,
        });
    }
};
Hooks.on('preCreateItem', onCreate);
