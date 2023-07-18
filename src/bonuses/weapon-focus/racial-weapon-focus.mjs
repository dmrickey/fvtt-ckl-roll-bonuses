import { MODULE_NAME } from "../../consts.mjs";
import { addNodeToRollBonus } from "../../roll-bonus-on-actor-sheet.mjs";
import { KeyedDFlagHelper, getDocDFlags } from "../../util/flag-helpers.mjs";
import { localHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize } from "../../util/localize.mjs";
import { registerSetting } from "../../util/settings.mjs";
import { uniqueArray } from "../../util/unique-array.mjs";
import { gnomeWeaponFocusId, racialWeaponFocusKey, weaponFocusKey } from "./ids.mjs";

const gnomishKey = 'gnomish';

registerSetting({ key: gnomishKey });

class Settings {
    static get gnomish() { return Settings.#getSetting(gnomishKey); }
    // @ts-ignore
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key).toLowerCase(); }
}

// register hint on item with focus
registerItemHint((hintcls, _actor, item, _data) => {
    const current = item.getItemDictionaryFlag(racialWeaponFocusKey);
    if (!current) {
        return;
    }

    const label = `${current}`;

    const hint = hintcls.create(label, [], {});
    return hint;
});

// register hint on focused weapon/attack
registerItemHint((hintcls, actor, item, _data) => {
    if (item.type !== 'attack' && item.type !== 'weapon') return;

    const tags = item.system.tags;

    const dFlags = actor.itemFlags.dictionary;
    const helper = new KeyedDFlagHelper(dFlags, racialWeaponFocusKey);

    let label;
    if (tags.find(tag => helper.valuesForFlag(racialWeaponFocusKey).includes(tag))) {
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

    const tags = item.system.tags;

    const dFlags = actor.itemFlags.dictionary;
    const helper = new KeyedDFlagHelper(dFlags, racialWeaponFocusKey);

    const value = tags.find(tag => helper.valuesForFlag(racialWeaponFocusKey).includes(tag))
        ? 1
        : 0;

    if (value) {
        sources.push({ value, name: localize(weaponFocusKey), modifier: 'untyped', sort: -100 });
        return sources.sort((a, b) => b.sort - a.sort);
    }

    return sources;
}
Hooks.on(localHooks.itemGetAttackSources, getAttackSources);

/**
 * @type {Handlebars.TemplateDelegate}
 */
let focusSelectorTemplate;
Hooks.once(
    'setup',
    async () => focusSelectorTemplate = await getTemplate(`modules/${MODULE_NAME}/hbs/racial-weapon-focus-selector.hbs`)
);

/**
 * @param {ActionUse} actionUse
 */
function addWeaponFocusBonus({ actor, item, shared }) {
    if (!actor || !item?.system.tags?.length) return;

    const tags = item.system.tags;

    const dFlags = actor.itemFlags.dictionary;
    const helper = new KeyedDFlagHelper(dFlags, racialWeaponFocusKey);

    const value = tags.find(value => helper.valuesForFlag(racialWeaponFocusKey).includes(value))
        ? 1
        : 0;

    if (value) {
        shared.attackBonus.push(`${value}[${localize(weaponFocusKey)}]`);
    }
}
Hooks.on(localHooks.actionUseAlterRollData, addWeaponFocusBonus);

Hooks.on('renderItemSheet', (
    /** @type {{}} */ _app,
    /** @type {[HTMLElement]} */[html],
    /** @type {{ item: ItemPF; }} */ { item },
) => {
    const isRacial = item?.flags.core?.sourceId.includes(gnomeWeaponFocusId) || item.system.flags.dictionary.hasOwnProperty(racialWeaponFocusKey);
    if (!isRacial) return;

    const current = item.getItemDictionaryFlag(racialWeaponFocusKey);

    if (!current) {
        item.setItemDictionaryFlag(racialWeaponFocusKey, Settings.gnomish);
    }

    const templateData = { current, racialDefault: Settings.gnomish };
    const div = document.createElement('div');
    div.innerHTML = focusSelectorTemplate(templateData, { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true });

    const select = div.querySelector('#weapon-focus-selector');
    select?.addEventListener(
        'change',
        async (event) => {
            // @ts-ignore - event.target is HTMLTextAreaElement
            const /** @type {HTMLTextAreaElement} */ target = event.target;
            await item.setItemDictionaryFlag(racialWeaponFocusKey, target?.value);
        },
    );
    addNodeToRollBonus(html, div);
});
