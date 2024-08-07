import { stringSelect } from "../../handlebars-handlers/bonus-inputs/string-select.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { KeyedDFlagHelper, getDocDFlags } from "../../util/flag-helpers.mjs";
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

Hooks.once('ready', () => {
    SpecificBonuses.registerSpecificBonus({ journal, key: weaponFocusKey });
    SpecificBonuses.registerSpecificBonus({ journal, key: greaterWeaponFocusKey, parent: weaponFocusKey });
    SpecificBonuses.registerSpecificBonus({ journal, key: mythicWeaponFocusKey, parent: weaponFocusKey });
});

class Settings {
    static get weaponFocus() { return LanguageSettings.getTranslation(weaponFocusKey); }

    static {
        LanguageSettings.registerItemNameTranslation(weaponFocusKey);
    }
}

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const key = allKeys.find((k) => item.system.flags.dictionary[k] !== undefined);
    if (!key) {
        return;
    }

    const currentTarget = getDocDFlags(item, key)[0];
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

    const helper = new KeyedDFlagHelper(actor, {}, weaponFocusKey, greaterWeaponFocusKey, mythicWeaponFocusKey);

    const isFocused = intersects(baseTypes, helper.valuesForFlag(weaponFocusKey));
    const isGreater = intersects(baseTypes, helper.valuesForFlag(greaterWeaponFocusKey));
    const isMythic = intersects(baseTypes, helper.valuesForFlag(mythicWeaponFocusKey));

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

    const helper = new KeyedDFlagHelper(actor, {}, weaponFocusKey, greaterWeaponFocusKey, mythicWeaponFocusKey);

    if (baseTypes.find(bt => helper.valuesForFlag(weaponFocusKey).includes(bt))) {
        value += 1;
    }
    if (baseTypes.find(bt => helper.valuesForFlag(greaterWeaponFocusKey).includes(bt))) {
        value += 1;
        name = localizeBonusLabel(greaterWeaponFocusKey);
    }
    if (baseTypes.find(bt => helper.valuesForFlag(mythicWeaponFocusKey).includes(bt))) {
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

    const helper = new KeyedDFlagHelper(actor, {}, weaponFocusKey, greaterWeaponFocusKey, mythicWeaponFocusKey);
    let key = '';

    if (intersects(baseTypes, helper.valuesForFlag(weaponFocusKey))) {
        value += 1;
        key = weaponFocusKey;
    }
    if (intersects(baseTypes, helper.valuesForFlag(greaterWeaponFocusKey))) {
        value += 1;
        key = greaterWeaponFocusKey;
    }
    if (intersects(baseTypes, helper.valuesForFlag(mythicWeaponFocusKey))) {
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
    const isGreater = (name.includes(Settings.weaponFocus) && name.includes(LanguageSettings.greater))
        || sourceId.includes(greaterWeaponFocusId)
        || item.system.flags.dictionary[greaterWeaponFocusKey] !== undefined;
    const isMythic = (name.includes(Settings.weaponFocus) && name.includes(LanguageSettings.mythic))
        || sourceId.includes(mythicWeaponFocusId)
        || item.system.flags.dictionary[mythicWeaponFocusKey] !== undefined;
    const isRacial = sourceId.includes(gnomeWeaponFocusId)
        || item.system.flags.dictionary[racialWeaponFocusKey] !== undefined;

    if (isGreater || isMythic) {
        key = isGreater ? greaterWeaponFocusKey : mythicWeaponFocusKey;

        if (actor) {
            choices = getDocDFlags(actor, weaponFocusKey, { includeInactive: false }).map((x) => `${x}`);
        }
    }
    else if ((name.includes(Settings.weaponFocus) && !isRacial)
        || sourceId.includes(weaponFocusId)
    ) {
        key = weaponFocusKey;
    }

    if (!key) {
        // check if it has a manual key
        key = allKeys.find((k) => item.system.flags.dictionary[k] !== undefined);
        if (!key) {
            return;
        }
    }

    if (key === weaponFocusKey) {
        choices = uniqueArray(actor?.items
            ?.filter(
                /** @returns {item is ItemWeaponPF | ItemAttackPF} */
                (item) => item.type === 'weapon' || item.type === 'attack')
            .flatMap((item) => item.system.baseTypes ?? []));
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
