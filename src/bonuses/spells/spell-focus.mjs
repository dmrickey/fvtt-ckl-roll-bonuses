import { MODULE_NAME } from "../../consts.mjs";
import { addNodeToRollBonus } from "../../roll-bonus-on-actor-sheet.mjs";
import { KeyedDFlagHelper, getDocDFlags } from "../../util/flag-helpers.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize } from "../../util/localize.mjs";
import { registerSetting } from "../../util/settings.mjs";

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

// todo register info

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

Hooks.on('pf1GetRollData', (
        /** @type {ItemAction} */ action,
        /** @type {RollData} */ rollData
) => {
    if (!(action instanceof pf1.components.ItemAction)) {
        return;
    }

    const { actor } = action;
    if (!actor) {
        return;
    }

    const item = action?.item;
    if (!(item instanceof pf1.documents.item.ItemSpellPF) || !rollData) {
        return;
    }

    const mythicFocuses = getDocDFlags(actor, mythicSpellFocusKey);
    const hasMythicFocus = !!mythicFocuses.find(f => f === item.system.school);

    rollData.dcBonus ||= 0;
    const handleFocus = ( /** @type {string} */key) => {
        const focuses = getDocDFlags(actor, key);
        const hasFocus = !!focuses.find(focus => focus === item.system.school);
        if (hasFocus) {
            rollData.dcBonus += 1;

            if (hasMythicFocus) {
                rollData.dcBonus += 1;
            }
        }
    }

    handleFocus(spellFocusKey);
    handleFocus(greaterSpellFocusKey);
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
