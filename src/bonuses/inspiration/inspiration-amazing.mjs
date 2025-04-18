// https://www.d20pfsrd.com/classes/hybrid-classes/investigator/investigator-talents/paizo-investigator-talents/amazing-inspiration/

// When using inspiration, the investigator rolls a d8 instead of a d6. At 20th level, the investigator rolls 2d8 and adds both dice to the result.

import { MODULE_NAME } from '../../consts.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { traitInput } from '../../handlebars-handlers/trait-input.mjs';
import { isMelee } from '../../util/action-type-helpers.mjs';
import { getCachedBonuses } from '../../util/get-cached-bonuses.mjs';
import { getSkills } from '../../util/get-skills.mjs';
import { itemHasCompendiumId } from '../../util/has-compendium-id.mjs';
import { LocalHookHandler, customGlobalHooks, localHooks } from '../../util/hooks.mjs';
import { isActorInCombat } from '../../util/is-actor-in-combat.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { localize, localizeBonusLabel, localizeBonusTooltip } from '../../util/localize.mjs';
import { onCreate } from '../../util/on-create.mjs';
import { LanguageSettings } from '../../util/settings.mjs';
import { truthiness } from '../../util/truthiness.mjs';
import { SpecificBonuses } from '../_all-specific-bonuses.mjs';
import { key as inspirationKey } from './inspiration.mjs';

const key = 'inspiration-amazing';
const compendiumId = 'nKbyztRQCU5XMbbs';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#inspiration';

SpecificBonuses.registerSpecificBonus({ journal, key, parent: inspirationKey });

class Settings {
    static get inpsiration() { return LanguageSettings.getTranslation(key); }

    static {
        LanguageSettings.registerItemNameTranslation(key);
    }
}

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const has = !!item.hasItemBooleanFlag(key);
    if (!has) {
        return;
    }

    const hint = hintcls.create('', [], { hint: localizeBonusTooltip(key), icon: 'fas fa-magnifying-glass' });
    return hint;
});

/** @returns {string} */
const label = () => { return localizeBonusLabel(key); }

/**
 * @param {Nullable<ActorPF>} actor
 * @returns {{inspiration: DiceString, improvedInspiration: DiceString} | undefined}
 */
const getDie = (actor) => {
    if (actor?.hasItemBooleanFlag(inspirationKey) && actor.hasItemBooleanFlag(key)) {
        const items = actor.itemFlags?.boolean[inspirationKey]?.sources ?? [];
        const classLevels = items
            .map(x => x.system.class)
            .map((c) => actor.itemTypes.class.find(x => x.system.tag === c))
            .filter(truthiness)
            .map((x) => x.system.level);
        const level = Math.max(...classLevels);
        const inspiration = level === 20
            ? '2d8'
            : '1d8';
        const improvedInspiration = level === 20
            ? '2d10'
            : '1d10';
        return { inspiration, improvedInspiration };
    }
}

/**
 * @param {ActorPF | ItemPF | ItemAction} thing
 * @param {RollData} rollData
 */
function onGetRollData(thing, rollData) {
    // this fires for actor -> item -> action. If I handle more than one then it would double up bonuses. So I handle the root-most option
    if (thing instanceof pf1.documents.actor.ActorPF) {
        const actor = thing;
        const die = getDie(actor);
        if (die) {
            rollData.inspiration = die.inspiration;
            rollData.improvedInspiration = die.improvedInspiration;
        }
    }
}
Hooks.on('pf1GetRollData', onGetRollData);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const hasFlag = item.hasItemBooleanFlag(key);
    if (!hasFlag) {
        const name = item?.name?.toLowerCase() ?? '';
        const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
        if (isEditable && (name === Settings.inpsiration || hasCompendiumId)) {
            item.addItemBooleanFlag(key);
        }
        return;
    }

    const die = getDie(item.actor)?.inspiration;

    showEnabledLabel({
        text: localize('inspiration-amazing-die', { die }),
        journal,
        key,
        item,
        parent: html,
    }, {
        canEdit: isEditable,
        inputType: 'specific-bonus',
    });
});

onCreate(compendiumId, () => Settings.inpsiration, key);
