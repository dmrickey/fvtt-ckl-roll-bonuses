import { MODULE_NAME } from '../../consts.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { traitInput } from '../../handlebars-handlers/trait-input.mjs';
import { isMelee } from '../../util/action-type-helpers.mjs';
import { onSkillSheetRender } from '../../util/add-skill-icon-hook-handler.mjs';
import { api } from '../../util/api.mjs';
import { intersects } from '../../util/array-intersects.mjs';
import { getCachedBonuses } from '../../util/get-cached-bonuses.mjs';
import { getIdsFromItem } from '../../util/get-id-array-from-flag.mjs';
import { getSkills } from '../../util/get-skills.mjs';
import { itemHasCompendiumId } from '../../util/has-compendium-id.mjs';
import { LocalHookHandler, customGlobalHooks, localHooks } from '../../util/hooks.mjs';
import { isActorInCombat } from '../../util/is-actor-in-combat.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { localize, localizeBonusLabel, localizeBonusTooltip } from '../../util/localize.mjs';
import { onCreate } from '../../util/on-create.mjs';
import { LanguageSettings } from '../../util/settings.mjs';
import { uniqueArray } from '../../util/unique-array.mjs';
import { SpecificBonuses } from '../_all-specific-bonuses.mjs';

export const key = 'inspiration';
const compendiumId = 'nKbyztRQCU5XMbbs';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#inspiration';

SpecificBonuses.registerSpecificBonus({ journal, key, });

export const getInspirationPart = () => localize(`@inspiration[${Settings.inpsiration}]`);

const allKnowledge = /** @type {const} */ ('all-knowledge');

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

/**
 * @param {ActorPF | ItemPF | ItemAction} thing
 * @param {RollData} rollData
 */
function onGetRollData(thing, rollData) {
    // this fires for actor -> item -> action. If I handle more than one then it would double up bonuses. So I handle the root-most option
    if (thing instanceof pf1.documents.actor.ActorPF) {
        const actor = thing;

        if (actor.itemFlags?.boolean[key]) {
            if (!rollData.inspiration) {
                rollData.inspiration = '1d6';
            }
            if (!rollData.improvedInspiration) {
                rollData.improvedInspiration = '1d8';
            }
        }
    }
}
Hooks.on('pf1GetRollData', onGetRollData);

/**
 * @param {ItemPF} item
 * @returns {SkillId[]}
 */
const getInspirationSkillsFromItem = (item) => {
    /** @type {(SkillId | 'all-knowledge')[]} */
    var skills = getIdsFromItem(item, key);

    const index = skills.indexOf(allKnowledge);
    if (index > -1) { // Check if the element exists
        skills.splice(index, 1); // Remove 1 element at the index
        skills.push(...api.config.knowledgeSkills);
    }

    return /** @type {SkillId[]} */ (skills);
}

/**
 * @param {ActorPF} actor
 * @returns {SkillId[]}
 */
const getInspirationSkillsFromActor = (actor) => {
    const items = actor.itemFlags?.boolean[key]?.sources ?? [];
    const skills = uniqueArray(items.flatMap(getInspirationSkillsFromItem));
    return skills;
};

/**
 * @param {ActorPF} actor
 * @returns {HTMLElement}
 */
function createInspirationIcon(actor) {
    const icon = document.createElement('a');
    icon.classList.add('far', 'fa-magnifying-glass', 'ckl-skill-icon');

    const rollData = actor.getRollData();
    const tip = localize('skill-sheet.inspiration.skill-tip', { die: rollData.inspiration });
    icon.setAttribute('data-tooltip', tip);
    icon.setAttribute('data-tooltip-direction', 'UP');

    return icon;
}

onSkillSheetRender(
    getInspirationSkillsFromActor,
    createInspirationIcon,
);

/**
 * @param {ActorPF} actor
 * @param {ActorRollOptions} options
 * @param {SkillId} skill
 */
function onRollSkill(actor, options, skill) {
    const inspirations = getInspirationSkillsFromActor(actor);
    if (intersects(inspirations, skill)) {
        const ranks = options.rollData?.skills[skill]?.rank ?? 0;
        if (ranks) {
            options.parts ||= [];
            options.parts.push('@inspiration[Inspiration]'); // TODO i18n me
        }
    }
}
Hooks.on('pf1PreActorRollSkill', onRollSkill);

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

    const choices = /** @type {Record<string, string>} */ (getSkills(item.actor, isEditable));
    api.config.knowledgeSkills.forEach((id) => delete (choices[id]));

    choices[allKnowledge] = localize(allKnowledge);

    traitInput({
        choices,
        hasCustom: false,
        item,
        journal,
        key,
        limit: 3,
        parent: html,
    }, {
        canEdit: isEditable,
        inputType: 'specific-bonus',
    });
});

onCreate(compendiumId, () => Settings.inpsiration, key);

api.config.knowledgeSkills = [
    'kar',
    'kdu',
    'ken',
    'kge',
    'khi',
    'klo',
    'kna',
    'kno',
    'kpl',
    'kre',
];
