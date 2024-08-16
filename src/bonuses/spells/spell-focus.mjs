import { MODULE_NAME } from '../../consts.mjs';
import { keyValueSelect } from "../../handlebars-handlers/bonus-inputs/key-value-select.mjs";
import { LocalHookHandler, customGlobalHooks, localHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize, localizeBonusLabel } from "../../util/localize.mjs";
import { LanguageSettings } from "../../util/settings.mjs";
import { signed } from "../../util/to-signed-string.mjs";
import { SpecificBonuses } from '../all-specific-bonuses.mjs';

export const spellFocusKey = 'spell-focus';
const greaterSpellFocusKey = 'greater-spell-focus';
const mythicSpellFocusKey = 'mythic-spell-focus';

const allKeys = [spellFocusKey, greaterSpellFocusKey, mythicSpellFocusKey];

const spellFocusId = 'V2zY7BltkpSXwejy';
const greaterSpellFocusId = 'LSykiaxYWzva2boF';
const mythicSpellFocusId = 'TOMEhAeZsgGHrSH6';

const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#spell-focus';

Hooks.once('ready', () => {
    SpecificBonuses.registerSpecificBonus({ journal, key: spellFocusKey });
    SpecificBonuses.registerSpecificBonus({ journal, key: greaterSpellFocusKey, parent: spellFocusKey });
    SpecificBonuses.registerSpecificBonus({ journal, key: mythicSpellFocusKey, parent: spellFocusKey });
});

class Settings {
    static get spellFocus() { return LanguageSettings.getTranslation(spellFocusKey); }

    static {
        LanguageSettings.registerItemNameTranslation(spellFocusKey);
    }
}

/**
 * @param {ItemPF} item
 * @param {RollData} _rollData
 */
function doIt(item, _rollData) {
    if (!item?.actor || !item.isActive) return;

    if (item.hasItemBooleanFlag(spellFocusKey)) {
        item.actor[MODULE_NAME][spellFocusKey] ||= [];
        item.actor[MODULE_NAME][spellFocusKey].push(item);
    }
    if (item.hasItemBooleanFlag(greaterSpellFocusKey)) {
        item.actor[MODULE_NAME][greaterSpellFocusKey] ||= [];
        item.actor[MODULE_NAME][greaterSpellFocusKey].push(item);
    }
    if (item.hasItemBooleanFlag(mythicSpellFocusKey)) {
        item.actor[MODULE_NAME][mythicSpellFocusKey] ||= [];
        item.actor[MODULE_NAME][mythicSpellFocusKey].push(item);
    }
}
LocalHookHandler.registerHandler(localHooks.prepareData, doIt);

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

    const isFocused = actor[MODULE_NAME][spellFocusKey]?.some(x => x.getFlag(MODULE_NAME, spellFocusKey) === item.system.school);
    const isGreater = actor[MODULE_NAME][greaterSpellFocusKey]?.some(x => x.getFlag(MODULE_NAME, greaterSpellFocusKey) === item.system.school);
    const isMythic = actor[MODULE_NAME][mythicSpellFocusKey]?.some(x => x.getFlag(MODULE_NAME, mythicSpellFocusKey) === item.system.school);

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

    const isFocused = !!actor[MODULE_NAME][spellFocusKey]?.some(x => x.getFlag(MODULE_NAME, spellFocusKey) === item.system.school);
    const isGreater = !!actor[MODULE_NAME][greaterSpellFocusKey]?.some(x => x.getFlag(MODULE_NAME, greaterSpellFocusKey) === item.system.school);
    const isMythic = !!actor[MODULE_NAME][mythicSpellFocusKey]?.some(x => x.getFlag(MODULE_NAME, mythicSpellFocusKey) === item.system.school);

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
    const key = allKeys.find((k) => !!item.getFlag(MODULE_NAME, k));
    if (!key) {
        return;
    }

    const currentSchool = /** @type {keyof typeof pf1.config.spellSchools} */ (item.getFlag(MODULE_NAME, key));
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

    const hasMythicFocus = !!actor[MODULE_NAME][mythicSpellFocusKey]?.some(x => x.getFlag(MODULE_NAME, mythicSpellFocusKey) === item.system.school);

    let bonus = 0;
    const handleFocus = ( /** @type {spellFocusKey | greaterSpellFocusKey} */key) => {
        const hasFocus = !!actor[MODULE_NAME][key]?.some(x => x.getFlag(MODULE_NAME, key) === item.system.school);
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
    if (name.includes(Settings.spellFocus) || sourceId.includes(spellFocusId) || item.hasItemBooleanFlag(spellFocusKey)) {
        key = spellFocusKey;
    }

    const isGreater = (name.includes(Settings.spellFocus) && name.includes(LanguageSettings.greater)) || sourceId.includes(greaterSpellFocusId) || item.hasItemBooleanFlag(greaterSpellFocusKey);
    const isMythic = (name.includes(Settings.spellFocus) && name.includes(LanguageSettings.mythic)) || sourceId.includes(mythicSpellFocusId) || item.hasItemBooleanFlag(mythicSpellFocusKey);

    if (isGreater || isMythic) {
        key = isGreater ? greaterSpellFocusKey : mythicSpellFocusKey;

        if (actor) {
            spellSchools = /** @type {any} */ ( /** @type {unknown} */ {});
            const existingSpellFocuses = actor[MODULE_NAME][spellFocusKey]?.map(x => x.getFlag(MODULE_NAME, spellFocusKey)) || [];
            existingSpellFocuses.forEach((focus) => {
                // @ts-ignore
                spellSchools[focus] = pf1.config.spellSchools[focus] || focus;
            });
        }

        if (item.getFlag(MODULE_NAME, spellFocusKey)) {
            item.unsetFlag(MODULE_NAME, spellFocusKey);
        }
    }

    if (key && !item.hasItemBooleanFlag(key)) {
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
        isModuleFlag: true,
    });
});
