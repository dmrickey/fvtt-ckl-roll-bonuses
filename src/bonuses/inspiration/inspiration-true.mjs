// https://www.d20pfsrd.com/CLASSES/HYBRID-CLASSES/INVESTIGATOR/#TOC-True-Inspiration-Ex-:~:text=standard%20action.-,True%20Inspiration,-(Ex)

// At 20th level, an investigator can use inspiration on all skill checks—even ones he isn’t trained in—and all ability checks without spending inspiration.
//
// In addition, whenever he expends inspiration on an ability check, attack roll, saving throw, or skill check, he adds 2d6 rather than 1d6 to the result. Some talents can affect this. If using the amazing inspiration investigator talent, he rolls 2d8 instead. If using this with empathy, tenacious inspiration, underworld inspiration, or a similar talent, he rolls two sets of inspiration dice and uses the higher of the two results.

import { itemHasCompendiumId } from '../../util/has-compendium-id.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { localizeBonusTooltip } from '../../util/localize.mjs';
import { onCreate } from '../../util/on-create.mjs';
import { SpecificBonus } from '../_specific-bonus.mjs';
import { getSkillHints } from '../../util/get-skills.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { LanguageSettings } from '../../util/settings.mjs';
import { Inspiration } from './inspiration.mjs';

const compendiumId = 'H2Iac6ELVKBU6Ayu';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#inspiration';

export class InspirationTrue extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'inspiration-true'; }

    /** @inheritdoc @override */
    static get journal() { return journal; }

    /** @inheritdoc @override */
    static get parent() { return Inspiration.key; }
}
class Settings {
    static get inpsirationTrue() { return LanguageSettings.getTranslation(InspirationTrue.key); }

    static {
        LanguageSettings.registerItemNameTranslation(InspirationTrue.key);
    }
}

// register hint on source
registerItemHint((hintcls, actor, item, _data) => {
    const has = !!item.hasItemBooleanFlag(InspirationTrue.key);
    if (!has) {
        return;
    }

    let hintText = localizeBonusTooltip(InspirationTrue.key);
    const skills = getSkillHints(actor, item, InspirationTrue.key);
    if (skills.length) {
        hintText += '<br>' + skills;
    }

    const hint = hintcls.create('', [], { hint: hintText, icon: 'fas fa-magnifying-glass' });
    return hint;
});

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const hasFlag = item.hasItemBooleanFlag(InspirationTrue.key);
    if (!hasFlag) {
        const name = item?.name?.toLowerCase() ?? '';
        const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
        if (isEditable && (name === Settings.inpsirationTrue || hasCompendiumId)) {
            item.addItemBooleanFlag(InspirationTrue.key);
        }
        return;
    }

    showEnabledLabel({
        item,
        journal,
        key: InspirationTrue.key,
        parent: html,
    }, {
        canEdit: isEditable,
        inputType: 'specific-bonus',
    });
});

onCreate(
    compendiumId,
    () => Settings.inpsirationTrue,
    { booleanKeys: InspirationTrue.key },
);
