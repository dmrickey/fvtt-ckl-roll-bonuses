import { MODULE_NAME } from "../../consts.mjs";
import { addNodeToRollBonus } from "../../roll-bonus-on-actor-sheet.mjs";
import { getDocDFlags } from "../../util/flag-helpers.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { registerSetting } from "../../util/settings.mjs";

const spellFocusKey = 'spellFocus';
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

/**
 * @type {Handlebars.TemplateDelegate}
 */
let focusSelectorTemplate;
Hooks.once(
    'setup',
    async () => focusSelectorTemplate = await getTemplate(`modules/${MODULE_NAME}/hbs/spell-focus-selector.hbs`)
);

// before dialog pops up
Hooks.on('pf1PreActionUse', (/** @type {ActionUse} */actionUse) => {
    const { actor, item, shared } = actionUse;
    if (item?.type !== 'spell') {
        return;
    }

    /**
     * @param {string} key
     */
    const handleFocus = (key) => {
        const focuses = getDocDFlags(actor, key);
        const hasFocus = !!focuses.find(f => f === item.system.school);
        if (hasFocus) {
            shared.saveDC += 1;

            const mythicFocuses = getDocDFlags(actor, mythicSpellFocusKey);
            const hasMythicFocus = !!mythicFocuses.find(f => f === item.system.school);
            if (hasMythicFocus) {
                shared.saveDC += 1;
            }
        }
    }

    handleFocus(spellFocusKey);
    handleFocus(greaterSpellFocusKey);
});

Hooks.on('renderItemSheet', (
    /** @type {{}} */ _app,
    /** @type {[HTMLElement]} */[html],
    /** @type {{ item: ItemPF; }} */ data,
) => {
    const { item } = data;
    const name = item?.name?.toLowerCase() ?? '';

    /**
     * @type {string | undefined}
     */
    let key;
    let { spellSchools } = pf1.config;

    if (name.includes(Settings.spellFocus) || item?.flags.core?.sourceId.includes(spellFocusId)) {
        key = spellFocusKey;
    }

    const isGreater = (name.includes(Settings.spellFocus) && name.includes(Settings.greater)) || item?.flags.core?.sourceId.includes(greaterSpellFocusId);
    const isMythic = (name.includes(Settings.spellFocus) && name.includes(Settings.mythic)) || item?.flags.core?.sourceId.includes(mythicSpellFocusId);

    if (isGreater || isMythic) {
        key = isGreater ? greaterSpellFocusKey : mythicSpellFocusKey;

        const actor = item.actor;
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
