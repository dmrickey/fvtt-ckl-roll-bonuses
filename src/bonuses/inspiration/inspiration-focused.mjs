// https://www.d20pfsrd.com/feats/general-feats/focused-inspiration/

// Choose two skills that you either are trained in or can otherwise use untrained. You must be able to use inspiration on these skills. When you use inspiration with those skills, roll a d8 instead of a d6, or a d10 if you would normally roll a d8. If you have the true inspiration class feature, you roll twice as many such dice (2d8 or 2d10) as normal.

import { traitInput } from '../../handlebars-handlers/trait-input.mjs';
import { onSkillSheetRender } from '../../util/on-skill-sheet-render-handler.mjs';
import { intersects } from '../../util/array-intersects.mjs';
import { getIdsFromActor } from '../../util/get-id-array-from-flag.mjs';
import { getSkillChoices } from '../../util/get-skills.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { localize, localizeBonusTooltip } from '../../util/localize.mjs';
import { SpecificBonuses } from '../_all-specific-bonuses.mjs';
import { canUseInspirationForFree, getInspirationPart, inspirationFocusedKey as key, inspirationKey, getInspirationFocusedPart, InspirationLanguageSettings } from './_inspiration-helper.mjs';
import { onCreate } from '../../util/on-create.mjs';
import { itemHasCompendiumId } from '../../util/has-compendium-id.mjs';

const compendiumId = 'c6WT66xBw9y7KxUn';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#inspiration';

SpecificBonuses.registerSpecificBonus({ journal, key, parent: inspirationKey });

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const has = !!item.hasItemBooleanFlag(key);
    if (!has) {
        return;
    }

    const hint = hintcls.create('', [], { hint: localizeBonusTooltip(key), icon: 'fas fa-magnifying-glass ckl-extra-focus' });
    return hint;
});

onSkillSheetRender({
    key,
}, {
    classes: () => ['fas', 'fa-magnifying-glass', 'ckl-extra-focus', 'ckl-skill-icon'],
    getText: (actor) => {
        const rollData = actor.getRollData();
        const text = localize('skill-sheet.inspiration-focused.skill-tip', { die: rollData.improvedInspiration });
        return text;
    }
});

/**
 * @param {ActorPF} actor
 * @param {ActorRollOptions} options
 * @param {SkillId} skill
 */
function onRollSkill(actor, options, skill) {
    if (!canUseInspirationForFree(actor, skill)) {
        return;
    }

    const focused = getIdsFromActor(actor, key);
    if (!intersects(focused, skill)) {
        return;
    }

    options.parts ||= [];

    const base = getInspirationPart();
    const part = getInspirationFocusedPart();
    if (!options.parts.findSplice(x => x === base, part)) {
        options.parts.push(part);
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
        if (isEditable && (name === InspirationLanguageSettings.focusedInspiration || hasCompendiumId)) {
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
        parent: html,
    }, {
        canEdit: isEditable,
        inputType: 'specific-bonus',
    });
});

onCreate(
    compendiumId,
    () => InspirationLanguageSettings.focusedInspiration,
    key,
);
