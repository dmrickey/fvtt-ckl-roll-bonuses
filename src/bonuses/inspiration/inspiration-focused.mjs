// https://www.d20pfsrd.com/feats/general-feats/focused-inspiration/

// Choose two skills that you either are trained in or can otherwise use untrained. You must be able to use inspiration on these skills. When you use inspiration with those skills, roll a d8 instead of a d6, or a d10 if you would normally roll a d8. If you have the true inspiration class feature, you roll twice as many such dice (2d8 or 2d10) as normal.

import { traitInput } from '../../handlebars-handlers/trait-input.mjs';
import { onSkillSheetRender } from '../../util/add-skill-icon-hook-handler.mjs';
import { createSkillIcon } from '../../util/create-skill-icon.mjs';
import { getIdsBySourceFromActor, getIdsFromActor } from '../../util/get-id-array-from-flag.mjs';
import { getSkills } from '../../util/get-skills.mjs';
import { LocalHookHandler, localHooks } from '../../util/hooks.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { localize, localizeBonusTooltip } from '../../util/localize.mjs';
import { SpecificBonuses } from '../_all-specific-bonuses.mjs';

const key = 'inspiration-focused';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#inspiration';

SpecificBonuses.registerSpecificBonus({ journal, key, });

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const has = !!item.hasItemBooleanFlag(key);
    if (!has) {
        return;
    }

    const hint = hintcls.create('', [], { hint: localizeBonusTooltip(key), icon: 'fas fa-magnifying-glass ckl-fa-magnifying-glass' });
    return hint;
});

/**
 * @param {ActorPF} actor
 * @param {SkillId} id
 * @returns {HTMLElement}
 */
function createIcon(actor, id) {
    const rollData = actor.getRollData();
    const tip = localize('skill-sheet.roll-untrained.skill-tip', { die: rollData.inspiration });
    const icon = createSkillIcon(
        tip,
        ['fas', 'fa-book-open', 'ckl-skill-icon'],
        () => {
            const all = getIdsBySourceFromActor(actor, key);
            const item = all.find(x => x.ids.includes(id))?.source;
            if (item) {
                item.sheet.render(true);
            }
        }
    );
    return icon;
}

/**
 * @param {SkillInfo} skillInfo
 * @param {ActorPF} actor
 * @param {RollData} rollData
 */
function getSkillInfo(skillInfo, actor, rollData) {
    const ids = getIdsFromActor(actor, key);
    if (!ids.length) return;

    if (ids.includes(skillInfo.id)) {
        skillInfo.rt = false;
    }
}
LocalHookHandler.registerHandler(localHooks.actorGetSkillInfo, getSkillInfo);

onSkillSheetRender(
    (actor) => getIdsFromActor(actor, key),
    createIcon,
    (_id, li) => li.classList.remove('untrained'),
);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const hasFlag = item.hasItemBooleanFlag(key);
    if (!hasFlag) {
        return;
    }

    const choices = /** @type {Record<string, string>} */ (getSkills(item.actor, isEditable));

    traitInput({
        choices,
        hasCustom: false,
        item,
        journal,
        key,
        parent: html,
    }, {
        canEdit: isEditable,
        inputType: 'specific-bonus',
    });
});
