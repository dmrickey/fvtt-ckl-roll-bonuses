import { MODULE_NAME } from "../../consts.mjs";
import { addNodeToRollBonus } from "../../roll-bonus-on-actor-sheet.mjs";
import { KeyedDFlagHelper, getDocDFlags } from "../../util/flag-helpers.mjs";
import { localHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize } from "../../util/localize.mjs";
import { registerSetting } from "../../util/settings.mjs";
import { signed } from "../../util/to-signed-string.mjs";

export const spellFocusKey = 'spellFocus';
const greaterSpellFocusKey = 'greaterSpellFocus';
const mythicSpellFocusKey = 'mythicSpellFocus';

const allKeys = [spellFocusKey, greaterSpellFocusKey, mythicSpellFocusKey];

const spellFocusId = 'V2zY7BltkpSXwejy';
const greaterSpellFocusId = 'LSykiaxYWzva2boF';
const mythicSpellFocusId = 'TOMEhAeZsgGHrSH6';

registerSetting({ key: spellFocusKey });
registerSetting({ key: greaterSpellFocusKey });
registerSetting({ key: mythicSpellFocusKey });

class Settings {
    static get spellFocus() { return Settings.#getSetting(spellFocusKey); }
    static get greater() { return Settings.#getSetting(greaterSpellFocusKey); }
    static get mythic() { return Settings.#getSetting(mythicSpellFocusKey); }
    // @ts-ignore
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key).toLowerCase(); }
}

// add Info to chat card
Hooks.on(localHooks.itemGetTypeChatData, (
    /** @type {ItemPF} */ item,
    /** @type {string[]} */ props,
    /** @type {RollData} */ rollData,
) => {
    if (!item || !(item instanceof pf1.documents.item.ItemSpellPF)) return;
    const { actor } = item;
    if (!actor) return;

    const action = item.firstAction;
    if (!action) {
        return;
    }

    const helper = new KeyedDFlagHelper(actor, ...allKeys);

    const isFocused = helper.valuesForFlag(spellFocusKey).includes(item.system.school);
    const isGreater = helper.valuesForFlag(greaterSpellFocusKey).includes(item.system.school);
    const isMythic = helper.valuesForFlag(mythicSpellFocusKey).includes(item.system.school);

    if (isFocused || isGreater || isMythic) {
        let bonus = 0;
        if (isFocused) bonus += 1;
        if (isGreater) bonus += 1;
        if (isMythic) bonus *= 2;
        props.push(localize('dc-label-mod', { mod: signed(bonus), label: localize(spellFocusKey) }));
    }
});

// register hint on focused spell
registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemSpellPF)) {
        return;
    }

    const helper = new KeyedDFlagHelper(actor, spellFocusKey, greaterSpellFocusKey, mythicSpellFocusKey);

    const isFocused = helper.valuesForFlag(spellFocusKey).includes(item.system.school);
    const isGreater = helper.valuesForFlag(greaterSpellFocusKey).includes(item.system.school);
    const isMythic = helper.valuesForFlag(mythicSpellFocusKey).includes(item.system.school);

    if (isFocused || isGreater || isMythic) {
        const tips = []
        if (isFocused) tips.push(localize(spellFocusKey));
        if (isGreater) tips.push(localize(greaterSpellFocusKey));
        if (isMythic) tips.push(localize(mythicSpellFocusKey));
        return hintcls.create('', [], { icon: 'fas fa-book', hint: tips.join('\n') });
    }
});

// register hint on ability
registerItemHint((hintcls, _actor, item, _data) => {
    const key = allKeys.find((k) => item.system.flags.dictionary[k] !== undefined);
    if (!key) {
        return;
    }

    const currentSchool = getDocDFlags(item, key)[0];
    if (!currentSchool) {
        return;
    }

    const label = pf1.config.spellSchools[currentSchool] ?? currentSchool;

    const hint = hintcls.create(label, [], {});
    return hint;
});

/**
 * @param {ItemAction} action
 * @returns {number}
 */
function getDcBonus(action) {
    if (!(action instanceof pf1.components.ItemAction)) {
        return 0;
    }

    const { actor } = action;
    if (!actor) {
        return 0;
    }

    const { item } = action;
    if (!(item instanceof pf1.documents.item.ItemSpellPF)) {
        return 0;
    }

    const mythicFocuses = getDocDFlags(actor, mythicSpellFocusKey);
    const hasMythicFocus = !!mythicFocuses.find(f => f === item.system.school);

    let bonus = 0;
    const handleFocus = ( /** @type {string} */key) => {
        const focuses = getDocDFlags(actor, key);
        const hasFocus = !!focuses.find(focus => focus === item.system.school);
        if (hasFocus) {
            bonus += 1;

            if (hasMythicFocus) {
                bonus += 1;
            }
        }
    }

    handleFocus(spellFocusKey);
    handleFocus(greaterSpellFocusKey);

    return bonus;
}

Hooks.on('pf1GetRollData', (
        /** @type {ItemAction} */ action,
        /** @type {RollData} */ rollData
) => {
    const bonus = getDcBonus(action);
    rollData.dcBonus ||= 0;
    rollData.dcBonus += bonus;
});

/**
 * @type {Handlebars.TemplateDelegate}
 */
let focusSelectorTemplate;
Hooks.once(
    'setup',
    async () => focusSelectorTemplate = await getTemplate(`modules/${MODULE_NAME}/hbs/spell-focus-selector.hbs`)
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
    let { spellSchools } = pf1.config;

    const name = item?.name?.toLowerCase() ?? '';
    const sourceId = item?.flags.core?.sourceId ?? '';
    if (name.includes(Settings.spellFocus) || sourceId.includes(spellFocusId)) {
        key = spellFocusKey;
    }

    const isGreater = (name.includes(Settings.spellFocus) && name.includes(Settings.greater)) || sourceId.includes(greaterSpellFocusId);
    const isMythic = (name.includes(Settings.spellFocus) && name.includes(Settings.mythic)) || sourceId.includes(mythicSpellFocusId);

    if (isGreater || isMythic) {
        key = isGreater ? greaterSpellFocusKey : mythicSpellFocusKey;

        if (actor) {
            spellSchools = {};
            const existingSpellFocuses = getDocDFlags(actor, spellFocusKey);
            existingSpellFocuses.forEach((focus) => {
                spellSchools[focus] = pf1.config.spellSchools[focus];
            });
        }
    }

    if (!key) {
        // check if it has a manual key
        key = allKeys.find((k) => item.system.flags.dictionary[k] !== undefined);
        if (!key) {
            return;
        }
    }

    const currentSchool = getDocDFlags(item, key)[0];

    if (Object.keys(spellSchools).length && !currentSchool) {
        item.setItemDictionaryFlag(key, Object.keys(spellSchools)[0]);
    }

    const templateData = { spellSchools, currentSchool };

    const div = document.createElement('div');
    div.innerHTML = focusSelectorTemplate(templateData, { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true });

    const select = div.querySelector('#spell-focus-selector');
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
