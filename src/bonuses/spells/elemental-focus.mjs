import { keyValueSelect } from "../../handlebars-handlers/bonus-inputs/key-value-select.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { KeyedDFlagHelper, getDocDFlags } from "../../util/flag-helpers.mjs";
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize, localizeBonusLabel } from "../../util/localize.mjs";
import { LanguageSettings } from "../../util/settings.mjs";
import { signed } from "../../util/to-signed-string.mjs";
import { truthiness } from "../../util/truthiness.mjs";
import { SpecificBonuses } from '../all-specific-bonuses.mjs';

const elementalFocusKey = 'elementalFocus';
const greaterElementalFocusKey = 'greaterElementalFocus';
const mythicElementalFocusKey = 'mythicElementalFocus';

const allKeys = [elementalFocusKey, greaterElementalFocusKey, mythicElementalFocusKey];

const elementalFocusId = '1frgqDSnQFiTq0MC';
const greaterElementalFocusId = 'l4yE4RGFbORuDfp7';
const mythicElementalFocusId = 'yelJyBhjWtiIMgci';

const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#elemental-focus';

Hooks.once('ready', () => {
    SpecificBonuses.registerSpecificBonus({ journal, key: elementalFocusKey });
    SpecificBonuses.registerSpecificBonus({ journal, key: greaterElementalFocusKey, parent: elementalFocusKey });
    SpecificBonuses.registerSpecificBonus({ journal, key: mythicElementalFocusKey, parent: elementalFocusKey });
});

const icons = {
    acid: { icon: 'ra ra-droplet', css: 'ckl-acid-green' },
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
    static get elementalFocus() { return LanguageSettings.getTranslation(elementalFocusKey); }

    static {
        LanguageSettings.registerItemNameTranslation(elementalFocusKey);
    }
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

    const action = item.defaultAction;
    if (!action) return;

    const bonus = getDcBonus(action);
    if (bonus) {
        props.push(localize('dc-label-mod', { mod: signed(bonus), label: localizeBonusLabel(elementalFocusKey) }));
    }
});

// register on focused spell
registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemSpellPF)) {
        return;
    }

    const action = item.defaultAction;
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
            const tooltip = focuses.map((f) => localizeBonusLabel(f)).join('\n') + `\n${localize('dc-mod', { mod: signed(bonus) })}`;
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

    // @ts-ignore
    const match = icons[currentElement];
    const label = pf1.registry.damageTypes.get(`${currentElement}`) ?? currentElement;

    const hint = match
        ? hintcls.create('', [match.css], { hint: label.name, icon: match.icon })
        : hintcls.create(label.name, [], {});
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
    /** @type {ItemSheetPF} */ { actor, isEditable, item },
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
    const isElementalFocusFeat = name.includes(Settings.elementalFocus) && item.type === 'feat';
    const sourceId = item?.flags.core?.sourceId ?? '';
    if (isElementalFocusFeat || sourceId.includes(elementalFocusId)) {
        key = elementalFocusKey;
    }

    const isGreater = (isElementalFocusFeat && name.includes(LanguageSettings.greater))
        || sourceId.includes(greaterElementalFocusId);
    const isMythic = (isElementalFocusFeat && name.includes(LanguageSettings.mythic))
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

    const choices = Object.keys(elements).map((key) => ({ key, label: elements[key].name }));

    keyValueSelect({
        choices,
        item,
        journal,
        key,
        parent: html
    }, {
        canEdit: isEditable
    });
});
