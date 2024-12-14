import { MODULE_NAME } from '../../consts.mjs';
import { keyValueSelect } from "../../handlebars-handlers/bonus-inputs/key-value-select.mjs";
import { api } from '../../util/api.mjs';
import { intersects } from "../../util/array-intersects.mjs";
import { getCachedBonuses } from '../../util/get-cached-bonuses.mjs';
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../../util/localize.mjs";
import { LanguageSettings } from "../../util/settings.mjs";
import { signed } from "../../util/to-signed-string.mjs";
import { truthiness } from "../../util/truthiness.mjs";
import { uniqueArray } from '../../util/unique-array.mjs';
import { SpecificBonuses } from '../all-specific-bonuses.mjs';

export const elementalFocusKey = 'elemental-focus';
export const greaterElementalFocusKey = 'elemental-focus-greater';
export const mythicElementalFocusKey = 'elemental-focus-mythic';

const allKeys = [elementalFocusKey, greaterElementalFocusKey, mythicElementalFocusKey];

const elementalFocusCompendiumId = '1frgqDSnQFiTq0MC';
const greaterElementalFocusCompendiumId = 'l4yE4RGFbORuDfp7';
const mythicElementalFocusCompendiumId = 'yelJyBhjWtiIMgci';

const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#elemental-focus';

SpecificBonuses.registerSpecificBonus({ journal, key: elementalFocusKey });
SpecificBonuses.registerSpecificBonus({ journal, key: greaterElementalFocusKey, parent: elementalFocusKey });
SpecificBonuses.registerSpecificBonus({ journal, key: mythicElementalFocusKey, parent: elementalFocusKey });

{
    const icons = {
        acid: { icon: 'ra ra-droplet', css: 'ckl-acid-green' },
        cold: { icon: 'far fa-snowflake', css: 'ckl-cold-blue' },
        electric: { icon: 'fas fa-bolt-lightning', css: 'ckl-electric-yellow' },
        fire: { icon: 'fas fa-fire-flame-curved', css: 'ckl-fire-red' },
    };

    const damageElements = /** @type {const} */ ([
        'acid',
        'cold',
        'electric',
        'fire'
    ]);

    api.config.elementalFocus.damageElements = damageElements;
    api.config.elementalFocus.icons = icons;
}

const damageElements = api.config.elementalFocus.damageElements;
const icons = api.config.elementalFocus.icons;

class Settings {
    static get elementalFocus() { return LanguageSettings.getTranslation(elementalFocusKey); }

    static {
        LanguageSettings.registerItemNameTranslation(elementalFocusKey);
    }
}

/**
 * @param { ActorPF } actor
 * @param { elementalFocusKey | greaterElementalFocusKey | mythicElementalFocusKey } key
 * @returns {damageElements[number][]}
 */
const getFocusedElements = (actor, key) =>
    uniqueArray(getCachedBonuses(actor, key)
        .filter(x => x.hasItemBooleanFlag(key))
        .flatMap(x => x.getFlag(MODULE_NAME, key))
        .filter(truthiness)
    );

/**
 *
 * @param {ItemAction} action
 * @returns {string[]}
 */
const getActionDamageTypes = (action) => uniqueArray(action.data.damage.parts
    .map(({ type }) => type)
    .flatMap(({ custom, values }) => ([...custom.split(';').map(x => x.trim()), ...values]))
    .filter(truthiness));

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

    const damageTypes = getActionDamageTypes(action);

    const  /** @type {Hint[]} */ hints = [];
    damageTypes.forEach((damageType) => {
        const isFocused = intersects(damageType, getFocusedElements(actor, elementalFocusKey));
        if (!isFocused) { return; }

        const isGreater = intersects(damageType, getFocusedElements(actor, greaterElementalFocusKey));
        const isMythic = intersects(damageType, getFocusedElements(actor, mythicElementalFocusKey));
        const bonus = (1 + Number(isGreater)) * (Number(isMythic) + 1);

        const focuses = [elementalFocusKey];
        if (isGreater) focuses.push(greaterElementalFocusKey);
        if (isMythic) focuses.push(mythicElementalFocusKey);

        // @ts-ignore
        const match = icons[damageType];
        const tooltip = focuses.map((f) => localizeBonusLabel(f)).join('\n') + `\n${localize('dc-mod', { mod: signed(bonus) })}`;
        const hint = hintcls.create('', [match.css], { icon: match.icon, hint: tooltip });
        hints.push(hint);
    });
    return hints;
});

// register on granting ability
registerItemHint((hintcls, _actor, item, _data) => {
    const key = allKeys.find((k) => !!item.hasItemBooleanFlag(k));
    if (!key) {
        return;
    }

    /** @type {damageElements[number]} */
    const currentElement = item.getFlag(MODULE_NAME, key);
    if (!currentElement) {
        return;
    }

    const match = icons[currentElement];
    const label = pf1.registry.damageTypes.get(`${currentElement}`) ?? { name: currentElement };

    const hint = match
        ? hintcls.create('', [match.css], { hint: `${localizeBonusTooltip(key)} (${label.name})`, icon: match.icon })
        : hintcls.create(label.name, [], { hint: localizeBonusTooltip(key) });
    return hint;
});

/**
 * @param {ItemAction} action
 * @returns {number}
 */
function getDcBonus(action) {
    const { item, actor } = action;
    if (item?.type !== 'spell' || !actor) {
        return 0;
    }

    const damageTypes = getActionDamageTypes(action);

    const mythicFocuses = getFocusedElements(actor, mythicElementalFocusKey);
    const hasMythicFocus = intersects(damageTypes, mythicFocuses);

    let bonus = 0;
    const handleFocus = (/** @type { elementalFocusKey | greaterElementalFocusKey } */ key) => {
        const focuses = getFocusedElements(actor, key);
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
    const isElementalFocusFeat = item.hasItemBooleanFlag(elementalFocusKey) || (name.includes(Settings.elementalFocus) && item.type === 'feat' && item.subType !== 'classFeat');
    const sourceId = item?.flags.core?.sourceId ?? '';
    if (isElementalFocusFeat || sourceId.includes(elementalFocusCompendiumId)) {
        key = elementalFocusKey;
    }

    const isGreater = item.hasItemBooleanFlag(greaterElementalFocusKey)
        || (isElementalFocusFeat && name.includes(LanguageSettings.greater))
        || sourceId.includes(greaterElementalFocusCompendiumId);
    const isMythic = item.hasItemBooleanFlag(mythicElementalFocusKey)
        || (isElementalFocusFeat && name.includes(LanguageSettings.mythic))
        || sourceId.includes(mythicElementalFocusCompendiumId);

    if (isGreater || isMythic) {
        key = isGreater ? greaterElementalFocusKey : mythicElementalFocusKey;

        if (actor) {
            elements = {};
            // @ts-ignore
            const existingElementalFocuses = getFocusedElements(actor, elementalFocusKey);
            existingElementalFocuses.forEach((focus) => {
                elements[focus] = pf1.registry.damageTypes.get(focus);
            });
        }
    }

    if (isEditable && key && !item.hasItemBooleanFlag(key)) {
        item.addItemBooleanFlag(key);
    }

    if (!key) {
        return;
    }

    const choices = Object.keys(elements).map((key) => ({ key, label: elements[key]?.name ?? '' }));

    keyValueSelect({
        choices,
        item,
        journal,
        key,
        parent: html
    }, {
        canEdit: isEditable,
        inputType: 'specific-bonus',
    });
});

/**
 * @param {ItemPF} item
 * @param {object} data
 * @param {{temporary: boolean}} param2
 * @param {string} id
 */
const onCreate = (item, data, { temporary }, id) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;
    if (temporary) return;

    const name = item?.name?.toLowerCase() ?? '';
    const sourceId = item?.flags.core?.sourceId ?? '';

    const isRegular = (name.includes(Settings.elementalFocus) && item.type === 'feat' && item.subType !== 'classFeat')
        || sourceId.includes(elementalFocusCompendiumId);
    const isGreater = (name.includes(Settings.elementalFocus) && name.includes(LanguageSettings.greater))
        || sourceId.includes(greaterElementalFocusCompendiumId);
    const isMythic = (name.includes(Settings.elementalFocus) && name.includes(LanguageSettings.mythic))
        || sourceId.includes(mythicElementalFocusCompendiumId);

    /** @type {damageElements[number]} */
    let focused = damageElements[0];
    if (item.actor && (isGreater || isMythic)) {
        focused = getFocusedElements(item.actor, elementalFocusKey)[0] || '';
    }

    if (isMythic) {
        item.updateSource({
            [`system.flags.boolean.${mythicElementalFocusKey}`]: true,
        });

        if (focused && !item.flags[MODULE_NAME]?.[mythicElementalFocusKey]) {
            item.updateSource({
                [`flags.${MODULE_NAME}.${mythicElementalFocusKey}`]: focused,
            });
        }
    }
    else if (isGreater) {
        item.updateSource({
            [`system.flags.boolean.${greaterElementalFocusKey}`]: true,
        });

        if (focused && !item.flags[MODULE_NAME]?.[greaterElementalFocusKey]) {
            item.updateSource({
                [`flags.${MODULE_NAME}.${greaterElementalFocusKey}`]: focused,
            });
        }
    }
    else if (isRegular) {
        item.updateSource({
            [`system.flags.boolean.${elementalFocusKey}`]: true,
        });

        if (focused && !item.flags[MODULE_NAME]?.[elementalFocusKey]) {
            item.updateSource({
                [`flags.${MODULE_NAME}.${elementalFocusKey}`]: focused,
            });
        }
    }
};
Hooks.on('preCreateItem', onCreate);
