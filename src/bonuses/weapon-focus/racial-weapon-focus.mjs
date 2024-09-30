import { MODULE_NAME } from "../../consts.mjs";
import { textInput } from "../../handlebars-handlers/bonus-inputs/text-input.mjs";
import { intersects } from '../../util/array-intersects.mjs';
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize, localizeBonusLabel } from "../../util/localize.mjs";
import { registerSetting } from "../../util/settings.mjs";
import { truthiness } from '../../util/truthiness.mjs';
import { SpecificBonuses } from '../all-specific-bonuses.mjs';
import { gnomeWeaponFocusId, racialWeaponFocusKey, weaponFocusKey } from "./ids.mjs";

const key = racialWeaponFocusKey;
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#weapon-focus';

SpecificBonuses.registerSpecificBonus({ journal, key: racialWeaponFocusKey, parent: weaponFocusKey });

class Settings {
    static defaultRaceKey = 'weapon-focus-racial-default-race';

    static get racialWeaponFocus() { return Settings.#getSetting(key); }
    static get defaultRace() { return Settings.#getSetting(this.defaultRaceKey); }
    // This is a per-client string which is different than all the other language settings
    // @ts-ignore
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key).toLowerCase(); }

    static {
        registerSetting({ key, scope: 'client' });
        registerSetting({ key: this.defaultRaceKey, scope: 'client' });
    }
}

/**
 * @param {ActorPF} actor
 * @param {ItemPF} item
 * @returns {boolean}
 */
const isItemFocused = (actor, item) => {
    const tags = (item.system.tags || []).map((tag) => tag.toLocaleLowerCase());
    const values = (actor[MODULE_NAME][key] || [])
        .map(x => x.getFlag(MODULE_NAME, key))
        .filter(truthiness)
        .map(x => x.toLocaleLowerCase());
    return intersects(tags, values);
}

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const has = item.hasItemBooleanFlag(key);
    const current = item.getFlag(MODULE_NAME, key);
    if (!has || !current) {
        return;
    }

    const label = `${current}`;

    const hint = hintcls.create(label, [], {});
    return hint;
});

// register hint on focused weapon/attack
registerItemHint((hintcls, actor, item, _data) => {
    if (!['attack', 'weapon'].includes(item.type) || !actor) return;

    const isFocused = isItemFocused(actor, item);
    if (isFocused) {
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

    const isFocused = isItemFocused(actor, item);
    if (isFocused) {
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

    const isFocused = isItemFocused(actor, item);
    if (isFocused) {
        shared.attackBonus.push(`${1}[${localizeBonusLabel(weaponFocusKey)}]`);
    }
}
Hooks.on(customGlobalHooks.actionUseAlterRollData, addWeaponFocusBonus);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const hasKey = item.hasItemBooleanFlag(key);
    if (!hasKey) {
        const name = item?.name?.toLowerCase() ?? '';
        const sourceId = item?.flags.core?.sourceId ?? '';
        const isRacial = sourceId.includes(gnomeWeaponFocusId) || name.includes(Settings.defaultRace);
        if (isRacial) {
            item.addItemBooleanFlag(key);
        }
        return;
    }

    const current = item.getFlag(MODULE_NAME, key);
    if (!current) {
        item.setFlag(MODULE_NAME, key, Settings.defaultRace);
    }

    textInput({
        current,
        item,
        journal,
        key,
        parent: html,
    }, {
        canEdit: isEditable,
        isFormula: false,
    });
});
