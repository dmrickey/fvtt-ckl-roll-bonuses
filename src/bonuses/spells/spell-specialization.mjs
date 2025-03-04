// +2 CL to chosen spell from school with Spell Focus
// https://www.d20pfsrd.com/feats/general-feats/spell-specialization/

import { MODULE_NAME } from '../../consts.mjs';
import { stringSelect } from "../../handlebars-handlers/bonus-inputs/string-select.mjs";
import { getCachedBonuses } from '../../util/get-cached-bonuses.mjs';
import { itemHasCompendiumId } from '../../util/has-compendium-id.mjs';
import { customGlobalHooks, LocalHookHandler, localHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../../util/localize.mjs";
import { LanguageSettings } from "../../util/settings.mjs";
import { truthiness } from "../../util/truthiness.mjs";
import { uniqueArray } from "../../util/unique-array.mjs";
import { SpecificBonuses } from '../all-specific-bonuses.mjs';
import { getFocusedSchools } from "./spell-focus.mjs";

const key = 'spell-specialization';
const exclusionKey = 'spell-specialization-exclusions';
const compendiumId = 'CO2Qmj0aj76zJsew';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#spell-specialization';

SpecificBonuses.registerSpecificBonus({ journal, key });

class Settings {
    static get spellSpecialization() { return LanguageSettings.getTranslation(key); }

    static {
        LanguageSettings.registerItemNameTranslation(key);
    }
}

/**
 * @param {Nullable<ActorPF>} actor
 * @param {ItemSpellPF} spell
 * @returns {boolean}
 */
function isSpecializedSpell(actor, spell) {
    if (!actor) return false;

    const spellName = spell.name?.toLowerCase() ?? '';
    const sources = getCachedBonuses(actor, key);

    /** @param { string } value */
    const matches = (value) => {
        const match = actor.items.get(value) || fromUuidSync(value);
        return match
            ? spell.id === match.id
            : spellName.includes(`${value || ''}`.toLowerCase());
    }

    const isSpecialized = sources.some((source) => {
        const value = source.getFlag(MODULE_NAME, key);
        const exceptions = (/** @type {string } */ (source.system.flags.dictionary[exclusionKey]) || '')
            .split(';')
            .filter(truthiness)
            .map((x) => x.trim());
        const result = matches(value) && !exceptions.some(matches);
        return result;
    });

    return isSpecialized;
}

// add info to spell card
Hooks.on(customGlobalHooks.itemGetTypeChatData, (
    /** @type {ItemPF} */ item,
    /** @type {string[]} */ props,
    /** @type {RollData} */ _rollData,
) => {
    if (!item || !(item instanceof pf1.documents.item.ItemSpellPF)) return;
    const { actor } = item;
    if (!actor) return;

    if (isSpecializedSpell(actor, item)) {
        props.push(localize('cl-label-mod', { mod: '+2', label: localizeBonusLabel(key) }));
    }
});

// register hint on specialized spell
registerItemHint((hintcls, actor, item, _data) => {
    if (!(item instanceof pf1.documents.item.ItemSpellPF)) {
        return;
    }

    if (!isSpecializedSpell(actor, item)) {
        return;
    }

    const hint = hintcls.create(localize('cl-mod', { mod: '+2' }), [], { hint: localizeBonusLabel(key) });
    return hint;
});

// register hint on Spell Specialization
registerItemHint((hintcls, _actor, item, _data) => {
    const has = item.hasItemBooleanFlag(key);
    const current = item.getFlag(MODULE_NAME, key);
    if (!has || !current) {
        return;
    }

    const hint = hintcls.create(current, [], { hint: localizeBonusTooltip(key) });
    return hint;
});

Hooks.on('pf1GetRollData', (
    /** @type {ItemAction} */ action,
    /** @type {RollData} */ rollData
) => {
    if (!(action instanceof pf1.components.ItemAction)) {
        return;
    }

    const item = action?.item;
    if (!(item instanceof pf1.documents.item.ItemSpellPF)
        || item?.type !== 'spell'
        || !rollData
    ) {
        return;
    }

    if (!isSpecializedSpell(item.actor, item)) {
        return;
    }

    rollData.cl ||= 0;
    rollData.cl += 2;
});

/**
 * @param {string} html
 */
Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const hasKey = item.hasItemBooleanFlag(key);
    if (!hasKey) {
        const hasName = item.name?.toLowerCase() === Settings.spellSpecialization;
        const hasId = !!item?.flags?.core?.sourceId?.includes(compendiumId);
        if (isEditable && (hasName || hasId)) {
            item.addItemBooleanFlag(key);
        }
        return;
    }

    /** @type {string[]} */
    let choices = [];
    if (actor && isEditable) {
        const focuses = getFocusedSchools(actor);

        const spellChoices = actor?.items
            .filter(
                /** @returns {spell is ItemSpellPF} */
                (spell) => spell instanceof pf1.documents.item.ItemSpellPF
                    && focuses.includes(spell.system.school))
            ?? [];
        choices = uniqueArray(spellChoices.map(({ name }) => name)).sort();
    }

    stringSelect({
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
    const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
    const hasBonus = item.hasItemBooleanFlag(key);

    let choice = '';
    if (item.actor) {
        const focuses = getFocusedSchools(item.actor);

        const spellChoices = item.actor?.items
            .filter(
                /** @returns {spell is ItemSpellPF} */
                (spell) => spell instanceof pf1.documents.item.ItemSpellPF
                    && focuses.includes(spell.system.school))
            ?? [];
        const choices = uniqueArray(spellChoices.map(({ name }) => name)).sort();
        choice = choices[0] || '';
    }

    let updated = false;
    if ((name === Settings.spellSpecialization || hasCompendiumId) && !hasBonus) {
        item.updateSource({
            [`system.flags.boolean.${key}`]: true,
        });
        updated = true;
    }

    if ((hasBonus || updated) && choice && !item.flags[MODULE_NAME]?.[key]) {
        item.updateSource({
            [`flags.${MODULE_NAME}.${key}`]: choice,
        });
    }
};
Hooks.on('preCreateItem', onCreate);
