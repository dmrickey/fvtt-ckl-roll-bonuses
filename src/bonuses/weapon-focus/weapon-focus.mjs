import { MODULE_NAME } from '../../consts.mjs';
import { stringSelect } from "../../handlebars-handlers/bonus-inputs/string-select.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize, localizeBonusLabel } from "../../util/localize.mjs";
import { SharedSettings, LanguageSettings } from "../../util/settings.mjs";
import { signed } from '../../util/to-signed-string.mjs';
import { uniqueArray } from "../../util/unique-array.mjs";
import { SpecificBonuses } from '../all-specific-bonuses.mjs';
import {
    gnomeWeaponFocusId,
    greaterWeaponFocusId,
    greaterWeaponFocusKey,
    mythicWeaponFocusKey,
    mythicWeaponFocusId,
    racialWeaponFocusKey,
    weaponFocusId,
    weaponFocusKey,
} from "./ids.mjs";

const allKeys = [weaponFocusKey, greaterWeaponFocusKey, mythicWeaponFocusKey];
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#weapon-focus';

SpecificBonuses.registerSpecificBonus({ journal, key: weaponFocusKey });
SpecificBonuses.registerSpecificBonus({ journal, key: greaterWeaponFocusKey, parent: weaponFocusKey });
SpecificBonuses.registerSpecificBonus({ journal, key: mythicWeaponFocusKey, parent: weaponFocusKey });

class Settings {
    static get weaponFocus() { return LanguageSettings.getTranslation(weaponFocusKey); }

    static {
        LanguageSettings.registerItemNameTranslation(weaponFocusKey);
    }
}

/**
 * @param { ActorPF } actor
 * @param { weaponFocusKey | greaterWeaponFocusKey | mythicWeaponFocusKey } [key]
 * @returns {string[]}
 */
export const getFocusedWeapons = (actor, key = weaponFocusKey) =>
    uniqueArray(actor[MODULE_NAME][key]?.
        filter(x => x.hasItemBooleanFlag(key))
        .flatMap(x => x.getFlag(MODULE_NAME, key))
        ?? []
    );

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const key = allKeys.find((k) => !!item.hasItemBooleanFlag(k));
    if (!key) {
        return;
    }

    const currentTarget = item.getFlag(MODULE_NAME, key);
    if (!currentTarget) {
        return;
    }

    const label = `${currentTarget}`;

    const hint = hintcls.create(label, [], {});
    return hint;
});

// register hint on focused weapon/attack
registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)) {
        return;
    }

    const baseTypes = item.system.baseTypes;

    const isFocused = intersects(baseTypes, getFocusedWeapons(actor, weaponFocusKey));
    const isGreater = intersects(baseTypes, getFocusedWeapons(actor, greaterWeaponFocusKey));
    const isMythic = intersects(baseTypes, getFocusedWeapons(actor, mythicWeaponFocusKey));

    if (isFocused || isGreater || isMythic) {
        const tips = []
        let bonus = 0;
        if (isFocused) {
            tips.push(localizeBonusLabel(weaponFocusKey));
            bonus += 1;
        }
        if (isGreater) {
            tips.push(localizeBonusLabel(greaterWeaponFocusKey));
            bonus += 1;
        }
        if (isMythic) {
            tips.push(localizeBonusLabel(mythicWeaponFocusKey));
            bonus *= 2;
        }
        tips.push(localize('to-hit-mod', { mod: signed(bonus) }));
        return hintcls.create('', [], { icon: 'ra ra-sword', hint: tips.join('\n') });
    }
});

/**
 * Add Weapon Focus to tooltip
 * @param {ItemPF} item
 * @param {ModifierSource[]} sources
 * @returns {ModifierSource[]}
 */
function getAttackSources(item, sources) {
    const actor = item.actor;
    if (!actor) return sources;

    if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)) {
        return sources;
    }

    const baseTypes = item.system.baseTypes;
    let value = 0;
    let name = localizeBonusLabel(weaponFocusKey);

    if (intersects(baseTypes, getFocusedWeapons(actor, weaponFocusKey))) {
        value += 1;
    }
    if (intersects(baseTypes, getFocusedWeapons(actor, greaterWeaponFocusKey))) {
        value += 1;
        name = localizeBonusLabel(greaterWeaponFocusKey);
    }
    if (intersects(baseTypes, getFocusedWeapons(actor, mythicWeaponFocusKey))) {
        value *= 2;
        name = localizeBonusLabel(mythicWeaponFocusKey);
    }

    if (value) {
        sources.push({ value, name, modifier: 'untyped', sort: -100, });
        return sources.sort((a, b) => b.sort - a.sort);
    }

    return sources;
}
Hooks.on(customGlobalHooks.itemGetAttackSources, getAttackSources);

/**
 * @param {ActionUse} actionUse
 */
function addWeaponFocusBonus({ actor, item, shared }) {
    if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)) {
        return;
    }
    if (!actor || !item.system.baseTypes?.length) return;

    const baseTypes = item.system.baseTypes;
    let value = 0;

    let key = '';

    if (intersects(baseTypes, getFocusedWeapons(actor, weaponFocusKey))) {
        value += 1;
        key = weaponFocusKey;
    }
    if (intersects(baseTypes, getFocusedWeapons(actor, greaterWeaponFocusKey))) {
        value += 1;
        key = greaterWeaponFocusKey;
    }
    if (intersects(baseTypes, getFocusedWeapons(actor, mythicWeaponFocusKey))) {
        value *= 2;
        key = mythicWeaponFocusKey;
    }

    if (value) {
        shared.attackBonus.push(`${value}[${localizeBonusLabel(key)}]`);
    }
}
Hooks.on(customGlobalHooks.actionUseAlterRollData, addWeaponFocusBonus);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (SharedSettings.elephantInTheRoom) return;
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    /** @type {string | undefined} */
    let key;
    /** @type {(string)[]} */
    let choices = [];

    const name = item?.name?.toLowerCase() ?? '';
    const sourceId = item?.flags.core?.sourceId ?? '';
    const isGreater = item.hasItemBooleanFlag(greaterWeaponFocusId)
        || (name.includes(Settings.weaponFocus) && name.includes(LanguageSettings.greater))
        || sourceId.includes(greaterWeaponFocusId);
    const isMythic = item.hasItemBooleanFlag(mythicWeaponFocusKey)
        || (name.includes(Settings.weaponFocus) && name.includes(LanguageSettings.mythic))
        || sourceId.includes(mythicWeaponFocusId);
    const isRacial = item.hasItemBooleanFlag(racialWeaponFocusKey)
        || sourceId.includes(gnomeWeaponFocusId);

    if (isGreater || isMythic) {
        key = isGreater ? greaterWeaponFocusKey : mythicWeaponFocusKey;

        if (actor) {
            choices = getFocusedWeapons(actor, weaponFocusKey);
        }

        if (item.getFlag(MODULE_NAME, weaponFocusKey)) {
            item.unsetFlag(MODULE_NAME, weaponFocusKey);
        }
    }
    else if (item.hasItemBooleanFlag(weaponFocusKey)
        || (name.includes(Settings.weaponFocus) && !isRacial)
        || sourceId.includes(weaponFocusId)
    ) {
        key = weaponFocusKey;
        choices = uniqueArray(actor?.items
            ?.filter(
                /** @returns {item is ItemWeaponPF | ItemAttackPF} */
                (item) => item.type === 'weapon' || item.type === 'attack')
            .flatMap((item) => item.system.baseTypes ?? []));
    }

    if (key && !item.hasItemBooleanFlag(key)) {
        item.addItemBooleanFlag(key);
    }
    else if (!key) {
        return;
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
