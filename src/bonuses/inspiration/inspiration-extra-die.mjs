// https://www.d20pfsrd.com/classes/hybrid-classes/investigator/investigator-talents/paizo-investigator-talents/empathy/

// Increases the amount of dice rolled with inspiration for specific skills (like Empathy linked above)

import { traitInput } from '../../handlebars-handlers/trait-input.mjs';
import { getSkillChoices, getSkillHints } from '../../util/get-skills.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { localizeBonusTooltip } from '../../util/localize.mjs';
import { SpecificBonus } from '../_specific-bonus.mjs';
import { InspirationTenacious } from './inspiration-tenacious.mjs';
import { Inspiration } from './inspiration.mjs';

const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#inspiration';

export class InspirationExtraDie extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'inspiration-extra-die'; }

    /** @inheritdoc @override */
    static get journal() { return journal; }

    /** @inheritdoc @override */
    static get parent() { return Inspiration.key; }

    /** @inheritdoc @override */
    static get tooltip() { return InspirationTenacious.tooltip; }
}

// register hint on source
registerItemHint((hintcls, actor, item, _data) => {
    const has = !!item.hasItemBooleanFlag(InspirationExtraDie.key);
    if (!has) {
        return;
    }

    let hintText = localizeBonusTooltip(InspirationTenacious.key);
    const skills = getSkillHints(actor, item, InspirationExtraDie.key);
    if (skills.length) {
        hintText += '<br>' + skills;
    }

    const hint = hintcls.create('', [], { hint: hintText, icon: 'fas fa-magnifying-glass ckl-extra-fa-magnifying-glass' });
    return hint;
});

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const hasFlag = item.hasItemBooleanFlag(InspirationExtraDie.key);
    if (!hasFlag) {
        return;
    }

    const choices = getSkillChoices(item.actor, { isEditable });

    traitInput({
        choices,
        description: localizeBonusTooltip(InspirationTenacious.key),
        hasCustom: false,
        item,
        journal,
        key: InspirationExtraDie.key,
        parent: html,
    }, {
        canEdit: isEditable,
        inputType: 'specific-bonus',
    });
});
