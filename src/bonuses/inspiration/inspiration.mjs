import { traitInput } from '../../handlebars-handlers/trait-input.mjs';
import { onSkillSheetRender } from '../../util/on-skill-sheet-render-handler.mjs';
import { intersects } from '../../util/array-intersects.mjs';
import { itemHasCompendiumId } from '../../util/has-compendium-id.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { localize, localizeBonusTooltip } from '../../util/localize.mjs';
import { onCreate } from '../../util/on-create.mjs';
import { SpecificBonuses } from '../_all-specific-bonuses.mjs';
import { canUseInspirationForFree, getInspirationPart, InspirationLanguageSettings, inspirationKey as key } from './_inspiration-helper.mjs';
import { allKnowledgeSkillIds, getFlaggedSkillIdsBySourceFromActor, getFlaggedSkillIdsFromActor, getSkillChoices } from '../../util/get-skills.mjs';

const compendiumId = 'nKbyztRQCU5XMbbs';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#inspiration';

SpecificBonuses.registerSpecificBonus({ journal, key, });

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

onSkillSheetRender({
    key,
    getSkillIds: getFlaggedSkillIdsBySourceFromActor,
}, {
    classes: (actor, skillId) => {
        const classes = ['far', 'fa-magnifying-glass', 'ckl-skill-icon'];
        if (!canUseInspirationForFree(actor, skillId)) {
            classes.push('ckl-fa-slash');
        }
        return classes;
    },
    getText: (actor, skillId) => {
        const rollData = actor.getRollData();
        const text = canUseInspirationForFree(actor, skillId)
            ? localize('skill-sheet.inspiration.skill-tip', { die: rollData.inspiration })
            : localize('skill-sheet.inspiration.invalid-skill-tip', { die: rollData.inspiration });
        return text;
    }
});

/**
 * @param {ActorPF} actor
 * @param {ActorRollOptions} options
 * @param {SkillId} skill
 */
function onRollSkill(actor, options, skill) {
    const inspirations = getFlaggedSkillIdsFromActor(actor, key);
    if (intersects(inspirations, skill)) {
        const ranks = options.rollData?.skills[skill]?.rank ?? 0;
        if (ranks) {
            options.parts ||= [];
            options.parts.push(getInspirationPart());
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
        if (isEditable && (name === InspirationLanguageSettings.inpsiration || hasCompendiumId)) {
            item.addItemBooleanFlag(key);
        }
        return;
    }

    const choices = getSkillChoices(item.actor, { isEditable });

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

onCreate(
    compendiumId,
    () => InspirationLanguageSettings.inpsiration,
    key,
    /** @type {SkillId[]} */
    [
        allKnowledgeSkillIds,
        'lin',
        'spl'
    ],
);
