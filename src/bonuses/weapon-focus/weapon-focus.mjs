import { MODULE_NAME } from "../../consts.mjs";
import { addNodeToRollBonus } from "../../handlebars-handlers/roll-bonus-on-actor-sheet.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { KeyedDFlagHelper, getDocDFlags } from "../../util/flag-helpers.mjs";
import { localHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize } from "../../util/localize.mjs";
import { registerSetting } from "../../util/settings.mjs";
import { uniqueArray } from "../../util/unique-array.mjs";
import { gnomeWeaponFocusId, greaterWeaponFocusId, greaterWeaponFocusKey, racialWeaponFocusKey, weaponFocusId, weaponFocusKey } from "./ids.mjs";

const allKeys = [weaponFocusKey, greaterWeaponFocusKey];

registerSetting({ key: weaponFocusKey });
registerSetting({ key: greaterWeaponFocusKey });

class Settings {
    static get weaponFocus() { return Settings.#getSetting(weaponFocusKey); }
    static get greater() { return Settings.#getSetting(greaterWeaponFocusKey); }
    // @ts-ignore
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key).toLowerCase(); }
}

// register hint on item with focus
registerItemHint((hintcls, _actor, item, _data) => {
    const  /** @type {Hint[]} */ hints = [];
    allKeys.forEach((key) => {
        const current = item.getItemDictionaryFlag(key);
        if (current) {
            hints.push(hintcls.create(`${current}`, [], {}));
        }
    });
    return hints;
});

// register hint on focused weapon/attack
registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)) {
        return;
    }

    const baseTypes = item.system.baseTypes;

    const helper = new KeyedDFlagHelper(actor, weaponFocusKey, greaterWeaponFocusKey);

    let label;
    if (intersects(baseTypes, helper.valuesForFlag(greaterWeaponFocusKey))) {
        label = localize(greaterWeaponFocusKey);
    }
    else if (intersects(baseTypes, helper.valuesForFlag(weaponFocusKey))) {
        label = localize(weaponFocusKey);
    }

    if (label) {
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

    if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)) {
        return sources;
    }

    const baseTypes = item.system.baseTypes;
    let value = 0;
    let name = localize(weaponFocusKey);

    const weaponFocuses = getDocDFlags(actor, weaponFocusKey);
    const greaterWeaponFocuses = getDocDFlags(actor, greaterWeaponFocusKey);

    if (baseTypes.find(bt => weaponFocuses.includes(bt))) {
        value += 1;
    }
    if (baseTypes.find(bt => greaterWeaponFocuses.includes(bt))) {
        value += 1;
        name = localize(greaterWeaponFocusKey);
    }

    if (value) {
        sources.push({ value, name, modifier: 'untyped', sort: -100, });
        return sources.sort((a, b) => b.sort - a.sort);
    }

    return sources;
}
Hooks.on(localHooks.itemGetAttackSources, getAttackSources);

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

    const helper = new KeyedDFlagHelper(actor, weaponFocusKey, greaterWeaponFocusKey);

    if (baseTypes.find(value => helper.valuesForFlag(weaponFocusKey).includes(value))) {
        value += 1;
    }
    if (baseTypes.find(value => helper.valuesForFlag(greaterWeaponFocusKey).includes(value))) {
        value += 1;
    }

    if (value) {
        shared.attackBonus.push(`${value}[${localize(weaponFocusKey)}]`);
    }
}
Hooks.on(localHooks.actionUseAlterRollData, addWeaponFocusBonus);

/**
 * @type {Handlebars.TemplateDelegate}
 */
let focusSelectorTemplate;
Hooks.once(
    'setup',
    async () => focusSelectorTemplate = await getTemplate(`modules/${MODULE_NAME}/hbs/labeled-string-dropdown-selector.hbs`)
);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {

    /**
     * @type {string | undefined}
     */
    let key;
    /**
     * @type {(string | number)[]}
     */
    let choices = [];

    const name = item?.name?.toLowerCase() ?? '';
    const sourceId = item?.flags.core?.sourceId ?? '';
    const isGreater = (name.includes(Settings.weaponFocus) && name.includes(Settings.greater))
        || sourceId.includes(greaterWeaponFocusId)
        || item.system.flags.dictionary[greaterWeaponFocusKey] !== undefined;
    const isRacial = sourceId.includes(gnomeWeaponFocusId)
        || item.system.flags.dictionary[racialWeaponFocusKey] !== undefined;

    if (isGreater) {
        key = greaterWeaponFocusKey;

        if (actor) {
            choices = getDocDFlags(actor, weaponFocusKey);
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
        choices = uniqueArray(item.actor?.items
            ?.filter(
                /** @returns {item is ItemWeaponPF | ItemAttackPF} */
                (item) => item.type === 'weapon' || item.type === 'attack')
            .flatMap((item) => item.system.baseTypes ?? []));
    }

    const current = item.getItemDictionaryFlag(key);

    if (choices?.length && !current) {
        item.setItemDictionaryFlag(key, choices[0]);
    }

    const templateData = { choices, current, label: localize(key), key };
    const div = document.createElement('div');
    div.innerHTML = focusSelectorTemplate(templateData, { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true });

    const select = div.querySelector(`#string-selector-${key}`);
    select?.addEventListener(
        'change',
        async (event) => {
            if (!key) return;
            // @ts-ignore - event.target is HTMLTextAreaElement
            const /** @type {HTMLTextAreaElement} */ target = event.target;
            await item.setItemDictionaryFlag(key, target?.value);
        },
    );
    addNodeToRollBonus(html, div);
});
