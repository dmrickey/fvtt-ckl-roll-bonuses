import { MODULE_NAME } from "../../consts.mjs";
import { textInput } from "../../handlebars-handlers/bonus-inputs/text-input.mjs";
import { KeyedDFlagHelper } from "../../util/flag-helpers.mjs";
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize, localizeBonusLabel } from "../../util/localize.mjs";
import { registerSetting } from "../../util/settings.mjs";
import { SpecificBonuses } from '../all-specific-bonuses.mjs';
import { gnomeWeaponFocusId, racialWeaponFocusKey, weaponFocusKey } from "./ids.mjs";

const key = racialWeaponFocusKey;
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#weapon-focus';

Hooks.once('ready', () => SpecificBonuses.registerSpecificBonus({
    journal,
    key,
}));

class Settings {
    static defaultRaceKey = 'racial-weapon-focus-default-race';

    static get racialWeaponFocus() { return Settings.#getSetting(key); }
    static get defaultRace() { return Settings.#getSetting(this.defaultRaceKey); }
    // @ts-ignore
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key).toLowerCase(); }

    static {
        registerSetting({ key, scope: 'client' });
        registerSetting({ key: this.defaultRaceKey, scope: 'client' });
    }
}

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const current = item.getItemDictionaryFlag(key);
    if (!current) {
        return;
    }

    const label = `${current}`;

    const hint = hintcls.create(label, [], {});
    return hint;
});

// register hint on focused weapon/attack
registerItemHint((hintcls, actor, item, _data) => {
    if (!['attack', 'weapon'].includes(item.type)) return;

    const tags = (item.system.tags || []).map((tag) => tag.toLocaleLowerCase());

    const helper = new KeyedDFlagHelper(actor, {
        mustHave: {
            [key]: (value) => tags.includes(`${value}`.toLocaleLowerCase()),
        }
    }, key);

    if (helper.hasAnyFlags()) {
        const label = localize(`settings.${key}.name`);
        return hintcls.create(label, [], {});
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

    const tags = (item.system.tags || []).map((tag) => tag.toLocaleLowerCase());

    const helper = new KeyedDFlagHelper(actor, {
        mustHave: {
            [key]: (value) => tags.includes(`${value}`),
        }
    }, key);

    if (helper.hasAnyFlags()) {
        sources.push({ value: 1, name: localizeBonusLabel(weaponFocusKey), modifier: 'untyped', sort: -100 });
        return sources.sort((a, b) => b.sort - a.sort);
    }

    return sources;
}
Hooks.on(customGlobalHooks.itemGetAttackSources, getAttackSources);

/**
 * Add weapon focus to attack roll
 * @param {ActionUse} actionUse
 */
function addWeaponFocusBonus({ actor, item, shared }) {
    if (!actor || !item?.system.tags?.length) return;

    const tags = (item.system.tags || []).map((tag) => tag.toLocaleLowerCase());

    const helper = new KeyedDFlagHelper(actor, {
        mustHave: {
            [key]: (value) => tags.includes(`${value}`),
        }
    }, key);

    if (helper.hasAnyFlags()) {
        shared.attackBonus.push(`${1}[${localizeBonusLabel(weaponFocusKey)}]`);
    }
}
Hooks.on(customGlobalHooks.actionUseAlterRollData, addWeaponFocusBonus);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!isEditable) return;
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const name = item?.name?.toLowerCase() ?? '';
    const sourceId = item?.flags.core?.sourceId ?? '';
    const isRacial = sourceId.includes(gnomeWeaponFocusId)
        || item.system.flags.dictionary.hasOwnProperty(key)
        || name.includes(Settings.defaultRace);
    if (!isRacial) return;

    textInput({
        item,
        journal,
        key,
        parent: html,
    }, {
        isFormula: false,
    });
});
