// +2 CL to chosen spell from school with Spell Focus
// https://www.d20pfsrd.com/feats/general-feats/spell-specialization/

import { MODULE_NAME } from "../../consts.mjs";
import { stringSelect } from "../../handlebars-handlers/bonus-inputs/string-select.mjs";
import { getDocDFlags, KeyedDFlagHelper } from "../../util/flag-helpers.mjs";
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize, localizeSpecificBonusLabel } from "../../util/localize.mjs";
import { registerSetting } from "../../util/settings.mjs";
import { truthiness } from "../../util/truthiness.mjs";
import { uniqueArray } from "../../util/unique-array.mjs";
import { SpecificBonuses } from '../all-specific-bonuses.mjs';
import { spellFocusKey } from "./spell-focus.mjs";

const key = 'spell-specialization';
const exclusionKey = 'spell-specialization-exclusions';
const compendiumId = 'CO2Qmj0aj76zJsew';

registerSetting({ key });

Hooks.once('ready', () => SpecificBonuses.registerSpecificBonus({ key }));

class Settings {
    static get spellSpecialization() { return Settings.#getSetting(key); }
    // @ts-ignore
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key).toLowerCase(); }
}

/**
 * @param {Nullable<ActorPF>} actor
 * @param {ItemSpellPF} item
 * @returns {boolean}
 */
function isSpecializedSpell(actor, item) {
    if (!actor) return false;

    const name = item.name?.toLowerCase() ?? '';
    const helper = new KeyedDFlagHelper(
        actor,
        {
            mustHave: {
                [key]: (spec) => name.includes(`${spec || ''}`.toLowerCase()),
                [exclusionKey]: (exclusions) => {
                    const exceptions = `${exclusions || ''}`.toLowerCase()
                        .split(';')
                        .filter(truthiness)
                        .map((x) => x.trim());
                    return !exceptions.find((except) => name.includes(except));
                }
            }
        },
        key,
        exclusionKey
    );

    return !!helper.hasAnyFlags();
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
        props.push(localize('cl-label-mod', { mod: '+2', label: localizeSpecificBonusLabel(key) }));
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

    const hint = hintcls.create(localize('cl-mod', { mod: '+2' }), [], { hint: localizeSpecificBonusLabel(key) });
    return hint;
});

// register hint on Spell Specialization
registerItemHint((hintcls, _actor, item, _data) => {
    const current = getDocDFlags(item, key)[0]?.toString();
    if (!current) {
        return;
    }

    const hint = hintcls.create(current, [], {});
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
    /** @type {ItemSheetPF} */ { actor, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const hasKey = item.system.flags.dictionary[key] !== undefined;
    const hasName = item.name?.toLowerCase() === Settings.spellSpecialization;
    const hasId = !!item?.flags?.core?.sourceId?.includes(compendiumId);
    if (!(hasKey || hasName || hasId) || !actor) {
        return;
    }

    const helper = new KeyedDFlagHelper(actor, {}, spellFocusKey);
    const focuses = helper.stringValuesForFlag(spellFocusKey);
    const current = item.getItemDictionaryFlag(key);

    const spellChoices = actor?.items
        .filter(
            /** @returns {spell is ItemSpellPF} */
            (spell) => spell instanceof pf1.documents.item.ItemSpellPF
                && focuses.includes(spell.system.school))
        ?? [];
    const choices = uniqueArray(spellChoices.map(({ name }) => name)).sort();

    stringSelect({
        choices,
        current,
        item,
        key,
        label: localizeSpecificBonusLabel(key),
        parent: html
    });
});
