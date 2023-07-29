import { MODULE_NAME } from "../../consts.mjs";
import { addNodeToRollBonus } from "../../roll-bonus-on-actor-sheet.mjs";
import { intersection, intersects } from "../../util/array-intersects.mjs";
import { KeyedDFlagHelper, getDocDFlags } from "../../util/flag-helpers.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize } from "../../util/localize.mjs";
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

const icons = {
    acid: { icon: 'fas fa-droplet', css: 'ckl-acid-green' },
    cold: { icon: 'far fa-snowflake', css: 'ckl-cold-blue' },
    electric: { icon: 'fas fa-bolt-lightning', css: 'ckl-electric-yellow' },
    fire: { icon: 'fas fa-fire-flame-curved', css: 'ckl-fire-red' },
};

const damageElements = [
    'acid',
    'cold',
    'electric',
    'fire'
];

class Settings {
    static get elementalFocus() { return Settings.#getSetting(elementalFocusKey); }
    static get greater() { return Settings.#getSetting(greaterElementalFocusKey); }
    static get mythic() { return Settings.#getSetting(mythicElementalFocusKey); }
    // @ts-ignore
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key).toLowerCase(); }
}

// register on focused spell
registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemSpellPF)) {
        return;
    }

    const action = item.firstAction;
    if (!action) {
        return;
    }

    const helper = new KeyedDFlagHelper(actor, elementalFocusKey, greaterElementalFocusKey, mythicElementalFocusKey);

    const damageTypes = action.data.damage.parts
        .map(({ type }) => type)
        .flatMap(({ custom, values }) => ([...custom.split(';').map(x => x.trim()), ...values]))
        .filter(truthiness);

    const  /** @type {Hint[]} */ hints = [];
    damageElements.forEach((element) => {
        if (!damageTypes.includes(element)) {
            return;
        }

        const focuses = helper.keysForValue(element);
        if (focuses.length) {
            // @ts-ignore
            const match = icons[element];
            const hint = hintcls.create('', [match.css], { icon: match.icon, hint: focuses.map((f) => localize(f)).join('\n') });
            hints.push(hint);
        }
    });
    return hints;
});

// register on ability
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

// todo register info

// before dialog pops up
Hooks.on('pf1GetRollData', (
    /** @type {ItemAction} */ action,
    /** @type {RollData} */ rollData
) => {
    const { item, actor } = action;
    if (item?.type !== 'spell') {
        return;
    }

    const damageTypes = action.data.damage.parts
        .map(({ type }) => type)
        .flatMap(({ custom, values }) => ([...custom.split(';').map(x => x.trim()), ...values]))
        .filter(truthiness);

    const handleFocus = (/** @type {string} */key) => {
        const focuses = getDocDFlags(actor, key);
        const hasFocus = intersects(damageTypes, focuses);
        if (hasFocus) {
            rollData.dcBonus ||= 0;
            rollData.dcBonus += 1;

            const mythicFocuses = getDocDFlags(actor, mythicElementalFocusKey);
            const hasMythicFocus = intersects(damageTypes, mythicFocuses);
            if (hasMythicFocus) {
                rollData.dcBonus += 1;
            }
        }
    }

    handleFocus(elementalFocusKey);
    handleFocus(greaterElementalFocusKey);
});

/**
 * @type {Handlebars.TemplateDelegate}
 */
let focusSelectorTemplate;
Hooks.once(
    'setup',
    async () => focusSelectorTemplate = await getTemplate(`modules/${MODULE_NAME}/hbs/elemental-focus-selector.hbs`)
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
    let elements = Object.fromEntries(damageElements.map(k => [k, pf1.registry.damageTypes.get(k)]));

    const name = item?.name?.toLowerCase() ?? '';
    const sourceId = item?.flags.core?.sourceId ?? '';
    if (name.includes(Settings.elementalFocus) || sourceId.includes(elementalFocusId)) {
        key = elementalFocusKey;
    }

    const isGreater = (name.includes(Settings.elementalFocus) && name.includes(Settings.greater))
        || sourceId.includes(greaterElementalFocusId);
    const isMythic = (name.includes(Settings.elementalFocus) && name.includes(Settings.mythic))
        || sourceId.includes(mythicElementalFocusId);

    if (isGreater || isMythic) {
        key = isGreater ? greaterElementalFocusKey : mythicElementalFocusKey;

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
