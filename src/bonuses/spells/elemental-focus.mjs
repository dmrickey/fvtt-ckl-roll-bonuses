import { MODULE_NAME } from "../../consts.mjs";
import { addNodeToRollBonus } from "../../roll-bonus-on-actor-sheet.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { getDocDFlags } from "../../util/flag-helpers.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { registerSetting } from "../../util/settings.mjs";
import { truthiness } from "../../util/truthiness.mjs";

const elementalFocusKey = 'elementalFocus';
const greaterElementalFocusKey = 'greaterElementalFocus';
const mythicElementalFocusKey = 'mythicElementalFocus';

const allKeys = [elementalFocusKey, greaterElementalFocusKey, mythicElementalFocusKey];

const elementalFocusId = '1frgqDSnQFiTq0MC';
const greaterElementalFocusId = 'l4yE4RGFbORuDfp7';
const mythicElementalFocusId = 'yelJyBhjWtiIMgci';

registerSetting({ key: elementalFocusKey });
registerSetting({ key: greaterElementalFocusKey });
registerSetting({ key: mythicElementalFocusKey });

class Settings {
    static get elementalFocus() { return Settings.#getSetting(elementalFocusKey); }
    static get greater() { return Settings.#getSetting(greaterElementalFocusKey); }
    static get mythic() { return Settings.#getSetting(mythicElementalFocusKey); }
    // @ts-ignore
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key).toLowerCase(); }
}

const damageElements = [
    'acid',
    'cold',
    'electric',
    'fire'
];

/**
 * @type {Handlebars.TemplateDelegate}
 */
let focusSelectorTemplate;
Hooks.once(
    'setup',
    async () => focusSelectorTemplate = await getTemplate(`modules/${MODULE_NAME}/hbs/elemental-focus-selector.hbs`)
);

// before dialog pops up
Hooks.on('pf1PreActionUse', (/** @type {ActionUse} */actionUse) => {
    const { action, actor, item, shared } = actionUse;
    if (item?.type !== 'spell') {
        return;
    }

    const damageTypes = action.data.damage.parts
        // @ts-ignore
        .map(({ type }) => type)
        // @ts-ignore
        .flatMap(({ custom, values }) => ([...custom.split(';').map(x => x.trim()), ...values]))
        .filter(truthiness);

    const handleFocus = (/** @type {string} */key) => {
        const focuses = getDocDFlags(actor, key);
        const hasFocus = intersects(damageTypes, focuses);
        if (hasFocus) {
            shared.saveDC += 1;

            const mythicFocuses = getDocDFlags(actor, mythicElementalFocusKey);
            const hasMythicFocus = intersects(damageTypes, mythicFocuses);
            if (hasMythicFocus) {
                shared.saveDC += 1;
            }
        }
    }

    handleFocus(elementalFocusKey);
    handleFocus(greaterElementalFocusKey);
});

Hooks.on('renderItemSheet', (
    /** @type {{ }} */ _app,
    /** @type {[HTMLElement]} */[html],
    /** @type {{ item: ItemPF; }} */ data
) => {
    const { item } = data;
    const name = item?.name?.toLowerCase() ?? '';

    /**
     * @type {string | undefined}
     */
    let key;
    let elements = Object.fromEntries(damageElements.map(k => [k, pf1.registry.damageTypes.get(k)]));

    if (name.includes(Settings.elementalFocus) || item?.flags.core?.sourceId.includes(elementalFocusId)) {
        key = elementalFocusKey;
    }

    const isGreater = (name.includes(Settings.elementalFocus) && name.includes(Settings.greater))
        || item?.flags.core?.sourceId.includes(greaterElementalFocusId);
    const isMythic = (name.includes(Settings.elementalFocus) && name.includes(Settings.mythic))
        || item?.flags.core?.sourceId.includes(mythicElementalFocusId);

    if (isGreater || isMythic) {
        key = isGreater ? greaterElementalFocusKey : mythicElementalFocusKey;

        const actor = item.actor;
        if (actor) {
            elements = {};
            // @ts-ignore
            const /** @type {string[]}*/ existingElementalFocuses = getDocDFlags(actor, elementalFocusKey);
            existingElementalFocuses.forEach((focus) => {
                elements[focus] = pf1.registry.damageTypes.get(focus);
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

    const currentElement = getDocDFlags(item, key)[0];

    if (Object.keys(elements).length && !currentElement) {
        item.setItemDictionaryFlag(key, Object.keys(elements)[0]);
    }

    const templateData = { elements, currentElement };

    const div = document.createElement('div');
    div.innerHTML = focusSelectorTemplate(templateData, { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true });

    const select = div.querySelector('#elemental-focus-selector');
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

    const currentElement = getDocDFlags(item, key)[0];
    if (!currentElement) {
        return;
    }

    const label = pf1.registry.damageTypes.get(`${currentElement}`) ?? currentElement;

    const hint = hintcls.create(label.name, [], {});
    return hint;
});
