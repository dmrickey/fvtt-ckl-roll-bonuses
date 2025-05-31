// +2 CL to chosen spell from school with Spell Focus
// https://www.d20pfsrd.com/feats/general-feats/spell-specialization/

import { MODULE_NAME } from '../../consts.mjs';
import { stringSelect } from "../../handlebars-handlers/bonus-inputs/string-select.mjs";
import { getCachedBonuses } from '../../util/get-cached-bonuses.mjs';
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../../util/localize.mjs";
import { LanguageSettings } from "../../util/settings.mjs";
import { truthiness } from "../../util/truthiness.mjs";
import { uniqueArray } from "../../util/unique-array.mjs";
import { SpecificBonus } from '../_specific-bonus.mjs';
import { SpellFocus } from './spell-focus.mjs';

export class SpellSpecialization extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'spell-specialization'; }
    static get exclusionKey() { return `${this.key}-exclusions`; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#spell-specialization'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {string} spellName
     * @param {string[]} [exclusions]
     * @returns {Promise<void>}
     */
    static async configure(item, spellName, exclusions = []) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: spellName,
                    [this.exclusionKey]: exclusions.join(';'),
                }
            },
        });
    }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'CO2Qmj0aj76zJsew',
            isItemMatchFunc: (name) => name === Settings.name,
            showInputsFunc: (item, html, isEditable) => {
                /** @type {string[]} */
                let choices = [];
                if (item.actor && isEditable) {
                    const focuses = SpellFocus.getFocusedSchools(item.actor);
                    const spellChoices = item.actor.itemTypes.spell
                        .filter((spell) => focuses.includes(spell.system.school))
                        ?? [];
                    choices = uniqueArray(spellChoices.map(({ name }) => name)).sort();
                }

                stringSelect({
                    choices,
                    item,
                    journal: this.journal,
                    key: this.key,
                    parent: html
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
            options: {
                defaultFlagValuesFunc: (item) => {
                    if (!item?.actor) return;

                    const focuses = SpellFocus.getFocusedSchools(item.actor);
                    const spellChoices = item.actor.itemTypes.spell
                        .filter((spell) => focuses.includes(spell.system.school))
                        ?? [];
                    const choices = uniqueArray(spellChoices.map(({ name }) => name)).sort();
                    return { [this.key]: choices[0] }
                }
            }
        };
    }
}

class Settings {
    static get name() { return LanguageSettings.getTranslation(SpellSpecialization.key); }

    static {
        LanguageSettings.registerItemNameTranslation(SpellSpecialization.key);
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
    const sources = getCachedBonuses(actor, SpellSpecialization.key);

    /** @param { string } value */
    const matches = (value) => {
        const match = actor.items.get(value) || fromUuidSync(value);
        return match
            ? spell.id === match.id
            : spellName.includes(`${value || ''}`.toLowerCase());
    }

    const isSpecialized = sources.some((source) => {
        const value = source.getFlag(MODULE_NAME, SpellSpecialization.key);
        const exceptions = (/** @type {string } */ (source.system.flags.dictionary[SpellSpecialization.exclusionKey]) || '')
            .split(';')
            .filter(truthiness)
            .map((x) => x.trim())
            .filter(truthiness);
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
        props.push(localize('cl-label-mod', { mod: '+2', label: localizeBonusLabel(SpellSpecialization.key) }));
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

    const hint = hintcls.create(localize('cl-mod', { mod: '+2' }), [], { hint: localizeBonusLabel(SpellSpecialization.key) });
    return hint;
});

// register hint on Spell Specialization
registerItemHint((hintcls, _actor, item, _data) => {
    const has = item.hasItemBooleanFlag(SpellSpecialization.key);
    const current = item.getFlag(MODULE_NAME, SpellSpecialization.key);
    if (!has || !current) {
        return;
    }

    const hint = hintcls.create(current, [], { hint: localizeBonusTooltip(SpellSpecialization.key) });
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
