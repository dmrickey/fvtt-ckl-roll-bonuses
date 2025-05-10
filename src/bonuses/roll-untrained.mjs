import { traitInput } from '../handlebars-handlers/trait-input.mjs';
import { onSkillSheetRender } from '../util/on-skill-sheet-render-handler.mjs';
import { getFlaggedSkillIdsFromActor, getSkillChoices } from '../util/get-skills.mjs';
import { LocalHookHandler, localHooks } from '../util/hooks.mjs';
import { registerItemHint } from '../util/item-hints.mjs';
import { localize, localizeBonusTooltip } from '../util/localize.mjs';
import { SpecificBonus } from './_specific-bonus.mjs';

export const key = 'roll-untrained';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#roll-skills-untrained';

export class RollSkillUntrained extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return key; }

    /** @inheritdoc @override */
    static get journal() { return journal; }
}

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const has = !!item.hasItemBooleanFlag(key);
    if (!has) {
        return;
    }

    const hint = hintcls.create('', [], { hint: localizeBonusTooltip(key), icon: 'fas fa-book-open' });
    return hint;
});

/**
 * @param {SkillInfo} skillInfo
 * @param {ActorPF} actor
 * @param {RollData} _rollData
 */
function getSkillInfo(skillInfo, actor, _rollData) {
    const ids = getFlaggedSkillIdsFromActor(actor, key);
    if (!ids.length) return;

    if (ids.includes(skillInfo.id)) {
        skillInfo.rt = false;
    }
}
LocalHookHandler.registerHandler(localHooks.actorGetSkillInfo, getSkillInfo);

onSkillSheetRender({
    key,
    rowCallback: (_id, li) => li.classList.remove('untrained'),
}, {
    classes: () => ['fas', 'fa-book-open', 'ckl-skill-icon'],
    getText: () => localize('skill-sheet.roll-untrained.skill-tip')
});

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
