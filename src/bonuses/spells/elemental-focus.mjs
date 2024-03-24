import { MODULE_NAME } from "../../consts.mjs";
import { keyValueSelect } from "../../handlebars-handlers/bonus-inputs/key-value-select.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { KeyedDFlagHelper, getDocDFlags } from "../../util/flag-helpers.mjs";
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize } from "../../util/localize.mjs";
import { registerSetting } from "../../util/settings.mjs";
import { signed } from "../../util/to-signed-string.mjs";
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

// add Info to chat card
Hooks.on(customGlobalHooks.itemGetTypeChatData, (
    /** @type {ItemPF} */ item,
    /** @type {string[]} */ props,
    /** @type {RollData} */ rollData,
) => {
    if (!item || !(item instanceof pf1.documents.item.ItemSpellPF)) return;

    const { actor } = item;
    if (!actor) return;

    const action = item.firstAction;
    if (!action) return;

    const bonus = getDcBonus(action);
    if (bonus) {
        props.push(localize('dc-label-mod', { mod: signed(bonus), label: localize(elementalFocusKey) }));
    }
});

// register on focused spell
registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemSpellPF)) {
        return;
    }

    const action = item.firstAction;
    if (!action) {
        return;
    }

    const helper = new KeyedDFlagHelper(actor, {}, elementalFocusKey, greaterElementalFocusKey, mythicElementalFocusKey);

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
            const bonus = getDcBonus(action);
            const tooltip = focuses.map((f) => localize(f)).join('\n') + `\n${localize('dc-mod', { mod: signed(bonus) })}`;
            const hint = hintcls.create('', [match.css], { icon: match.icon, hint: tooltip });
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

/**
 * @param {ItemAction} action
 * @returns {number}
 */
function getDcBonus(action) {
    const { item, actor } = action;
    if (item?.type !== 'spell') {
        return 0;
    }

    const damageTypes = action.data.damage.parts
        .map(({ type }) => type)
        .flatMap(({ custom, values }) => ([...custom.split(';').map(x => x.trim()), ...values]))
        .filter(truthiness);

    const mythicFocuses = getDocDFlags(actor, mythicElementalFocusKey, { includeInactive: false });
    const hasMythicFocus = intersects(damageTypes, mythicFocuses);

    let bonus = 0;
    const handleFocus = (/** @type {string} */key) => {
        const focuses = getDocDFlags(actor, key, { includeInactive: false });
        const hasFocus = intersects(damageTypes, focuses);
        if (hasFocus) {
            bonus += 1;

            if (hasMythicFocus) {
                bonus += 1;
            }
        }
    }

    handleFocus(elementalFocusKey);
    handleFocus(greaterElementalFocusKey);

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

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

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
            const /** @type {string[]}*/ existingElementalFocuses = getDocDFlags(actor, elementalFocusKey, { includeInactive: false });
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

    const current = getDocDFlags(item, key)[0];
    const choices = Object.keys(elements).map((key) => ({ key, label: elements[key].name }));

    keyValueSelect({
        choices,
        current,
        item,
        key,
        label: localize(key),
        parent: html
    });
});
