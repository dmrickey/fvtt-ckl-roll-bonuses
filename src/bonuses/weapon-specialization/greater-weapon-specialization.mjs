// https://www.d20pfsrd.com/feats/combat-feats/weapon-specialization-combat/
// +2 damage on selected weapon type - requires Greater Weapon Focus and Weapon Specialization with selected weapon

import { stringSelect } from "../../handlebars-handlers/bonus-inputs/string-select.mjs";
import { intersection, intersects } from "../../util/array-intersects.mjs";
import { createChangeForTooltip } from '../../util/conditional-helpers.mjs';
import { KeyedDFlagHelper, getDocDFlags } from "../../util/flag-helpers.mjs";
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize, localizeBonusLabel } from "../../util/localize.mjs";
import { SharedSettings, LanguageSettings } from '../../util/settings.mjs';
import { SpecificBonuses } from '../all-specific-bonuses.mjs';
import { greaterWeaponFocusKey } from "../weapon-focus/ids.mjs";
import { WeaponSpecializationSettings, weaponSpecializationKey } from "./weapon-specialization.mjs";

const key = 'greater-weapon-specialization';
const compendiumId = 'asmQDyDYTtuXg8b4';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#weapon-specialization';

Hooks.once('ready', () => SpecificBonuses.registerSpecificBonus({ journal, key, parent: weaponSpecializationKey }));

// register hint on source feat
registerItemHint((hintcls, _actor, item, _data) => {
    const current = item.getItemDictionaryFlag(key);
    if (current) {
        return hintcls.create(`${current}`, [], {});
    }
});

// register hint on focused weapon/attack
registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)) {
        return;
    }

    if (item instanceof pf1.documents.item.ItemWeaponPF && !item.system.proficient) {
        return;
    }

    const baseTypes = item.system.baseTypes;
    const helper = new KeyedDFlagHelper(actor, {}, key);

    if (intersects(baseTypes, helper.valuesForFlag(key))) {
        return hintcls.create(`+2 ${localize('PF1.Damage')}`, [], { hint: localizeBonusLabel(key) });
    }
});

/**
 * @param {ActionUse} actionUse
 */
function addWeaponSpecialization({ actor, item, shared }) {
    if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)) {
        return;
    }
    if (!actor || !item.system.baseTypes?.length) return;

    const baseTypes = item.system.baseTypes;

    const helper = new KeyedDFlagHelper(actor, {}, key);
    if (intersects(baseTypes, helper.valuesForFlag(key))) {
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
    if (!actor) return sources;

    if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)) {
        return sources;
    }

    const name = localizeBonusLabel(key);

    const weaponSpecializationes = getDocDFlags(actor, key, { includeInactive: false });
    const baseTypes = item.system.baseTypes;
    const isFocused = intersects(baseTypes, weaponSpecializationes);

    if (isFocused) {
        const change = createChangeForTooltip({ name, value: 2 });
        return sources.push(change);
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
    if (!((name.includes(WeaponSpecializationSettings.weaponSpecialization) && name.includes(LanguageSettings.greater))
        || item.system.flags.dictionary[key] !== undefined
        || sourceId.includes(compendiumId))
    ) {
        return;
    }

    /** @type {string[]} */
    let choices = [];
    if (isEditable && actor) {
        const helper = new KeyedDFlagHelper(actor, {}, greaterWeaponFocusKey, weaponSpecializationKey);
        const focuses = helper.valuesForFlag(greaterWeaponFocusKey).map(x => `${x}`);
        const specs = helper.valuesForFlag(weaponSpecializationKey).map(x => `${x}`);
        choices = intersection(focuses, specs).sort();
    }

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
