import { MODULE_NAME } from '../../consts.mjs';
import { keyValueSelect } from "../../handlebars-handlers/bonus-inputs/key-value-select.mjs";
import { intersects } from '../../util/array-intersects.mjs';
import { getCachedBonuses } from '../../util/get-cached-bonuses.mjs';
import { LocalHookHandler, customGlobalHooks, localHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../../util/localize.mjs";
import { LanguageSettings } from "../../util/settings.mjs";
import { signed } from "../../util/to-signed-string.mjs";
import { truthiness } from '../../util/truthiness.mjs';
import { uniqueArray } from '../../util/unique-array.mjs';
import { SpecificBonuses } from '../all-specific-bonuses.mjs';

export const spellFocusKey = 'spell-focus';
export const greaterSpellFocusKey = 'spell-focus-greater';
export const mythicSpellFocusKey = 'spell-focus-mythic';

const allKeys = [spellFocusKey, greaterSpellFocusKey, mythicSpellFocusKey];

const spellFocusCompendiumId = 'V2zY7BltkpSXwejy';
const greaterSpellFocusCompendiumId = 'LSykiaxYWzva2boF';
const mythicSpellFocusCompendiumId = 'TOMEhAeZsgGHrSH6';

const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#spell-focus';

SpecificBonuses.registerSpecificBonus({ journal, key: spellFocusKey });
SpecificBonuses.registerSpecificBonus({ journal, key: greaterSpellFocusKey, parent: spellFocusKey });
SpecificBonuses.registerSpecificBonus({ journal, key: mythicSpellFocusKey, parent: spellFocusKey });

class Settings {
    static get spellFocus() { return LanguageSettings.getTranslation(spellFocusKey); }

    static {
        LanguageSettings.registerItemNameTranslation(spellFocusKey);
    }
}

/**
 * @param { ActorPF } actor
 * @param { spellFocusKey | greaterSpellFocusKey | mythicSpellFocusKey } [key]
 * @returns {string[]}
 */
export const getFocusedSchools = (actor, key = spellFocusKey) =>
    uniqueArray(getCachedBonuses(actor, key)
        .filter(x => x.hasItemBooleanFlag(key))
        .flatMap(x => x.getFlag(MODULE_NAME, key))
        .filter(truthiness)
    );

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
    if (!action) {
        return;
    }

    const isFocused = intersects(item.system.school, getFocusedSchools(actor, spellFocusKey));
    const isGreater = intersects(item.system.school, getFocusedSchools(actor, greaterSpellFocusKey));
    const isMythic = intersects(item.system.school, getFocusedSchools(actor, mythicSpellFocusKey));

    if (isFocused || isGreater || isMythic) {
        let bonus = 0;
        if (isFocused) bonus += 1;
        if (isGreater) bonus += 1;
        if (isMythic) bonus *= 2;
        props.push(localize('dc-label-mod', { mod: signed(bonus), label: localizeBonusLabel(spellFocusKey) }));
    }
});

// register hint on focused spell
registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemSpellPF)) {
        return;
    }

    const isFocused = intersects(item.system.school, getFocusedSchools(actor, spellFocusKey));
    const isGreater = intersects(item.system.school, getFocusedSchools(actor, greaterSpellFocusKey));
    const isMythic = intersects(item.system.school, getFocusedSchools(actor, mythicSpellFocusKey));

    if (isFocused || isGreater || isMythic) {
        const tips = []
        let bonus = 0;
        if (isFocused) {
            tips.push(localizeBonusLabel(spellFocusKey));
            bonus += 1;
        }
        if (isGreater) {
            tips.push(localizeBonusLabel(greaterSpellFocusKey));
            bonus += 1;
        }
        if (isMythic) {
            tips.push(localizeBonusLabel(mythicSpellFocusKey));
            bonus *= 2;
        }
        tips.push(localize('dc-mod', { mod: signed(bonus) }));
        return hintcls.create('', [], { icon: 'fas fa-book', hint: tips.join('\n') });
    }
});

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const key = allKeys.find((k) => !!item.hasItemBooleanFlag(k));
    if (!key) {
        return;
    }

    const currentSchool = /** @type {keyof typeof pf1.config.spellSchools} */ (item.getFlag(MODULE_NAME, key));
    if (!currentSchool) {
        return;
    }

    const label = pf1.config.spellSchools[currentSchool] ?? currentSchool;

    const hint = hintcls.create(label, [], { hint: localizeBonusTooltip(key) });
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

    const { actor, item } = action;
    if (!actor || !(item instanceof pf1.documents.item.ItemSpellPF)) {
        return 0;
    }

    const hasMythicFocus = intersects(item.system.school, getFocusedSchools(actor, mythicSpellFocusKey));

    let bonus = 0;
    const handleFocus = ( /** @type {spellFocusKey | greaterSpellFocusKey} */key) => {
        const hasFocus = intersects(item.system.school, getFocusedSchools(actor, key));
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
    let { spellSchools } = pf1.config;

    const name = item?.name?.toLowerCase() ?? '';
    const sourceId = item?.flags.core?.sourceId ?? '';
    if (
        item.hasItemBooleanFlag(spellFocusKey)
        || name.includes(Settings.spellFocus)
        || sourceId.includes(spellFocusCompendiumId)
    ) {
        key = spellFocusKey;
    }

    const isGreater = item.hasItemBooleanFlag(greaterSpellFocusKey)
        || (name.includes(Settings.spellFocus) && name.includes(LanguageSettings.greater))
        || sourceId.includes(greaterSpellFocusCompendiumId);
    const isMythic = item.hasItemBooleanFlag(mythicSpellFocusKey)
        || (name.includes(Settings.spellFocus) && name.includes(LanguageSettings.mythic))
        || sourceId.includes(mythicSpellFocusCompendiumId);

    if (isGreater || isMythic) {
        key = isGreater ? greaterSpellFocusKey : mythicSpellFocusKey;

        if (actor) {
            spellSchools = /** @type {any} */ ( /** @type {unknown} */ {});
            const existingSpellFocuses = getFocusedSchools(actor, spellFocusKey);
            existingSpellFocuses.forEach((focus) => {
                // @ts-ignore
                spellSchools[focus] = pf1.config.spellSchools[focus] || focus;
            });
        }
    }

    if (isEditable && key && !item.hasItemBooleanFlag(key)) {
        item.addItemBooleanFlag(key);
    }

    if (!key) {
        return;
    }

    const current = item.getFlag(MODULE_NAME, key);
    const choices = Object.entries(spellSchools)
        .map(([key, label]) => ({ key, label }));

    keyValueSelect({
        choices,
        current,
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

    const isRegular = name === Settings.spellFocus
        || sourceId.includes(spellFocusCompendiumId);
    const isGreater = (name.includes(Settings.spellFocus) && name.includes(LanguageSettings.greater))
        || sourceId.includes(greaterSpellFocusCompendiumId);
    const isMythic = (name.includes(Settings.spellFocus) && name.includes(LanguageSettings.mythic))
        || sourceId.includes(mythicSpellFocusCompendiumId);

    let focused = Object.keys(pf1.config.spellSchools)[0];
    if (item.actor && (isGreater || isMythic)) {
        focused = getFocusedSchools(item.actor, spellFocusKey)[0] || '';
    }

    if (isMythic) {
        item.updateSource({
            [`system.flags.boolean.${mythicSpellFocusKey}`]: true,
        });

        if (focused && !item.flags[MODULE_NAME]?.[mythicSpellFocusKey]) {
            item.updateSource({
                [`flags.${MODULE_NAME}.${mythicSpellFocusKey}`]: focused,
            });
        }
    }
    else if (isGreater) {
        item.updateSource({
            [`system.flags.boolean.${greaterSpellFocusKey}`]: true,
        });

        if (focused && !item.flags[MODULE_NAME]?.[greaterSpellFocusKey]) {
            item.updateSource({
                [`flags.${MODULE_NAME}.${greaterSpellFocusKey}`]: focused,
            });
        }
    }
    else if (isRegular) {
        item.updateSource({
            [`system.flags.boolean.${spellFocusKey}`]: true,
        });

        if (focused && !item.flags[MODULE_NAME]?.[spellFocusKey]) {
            item.updateSource({
                [`flags.${MODULE_NAME}.${spellFocusKey}`]: focused,
            });
        }
    }

};
Hooks.on('preCreateItem', onCreate);
