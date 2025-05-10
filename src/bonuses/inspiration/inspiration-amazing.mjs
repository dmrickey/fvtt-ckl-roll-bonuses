// https://www.d20pfsrd.com/classes/hybrid-classes/investigator/investigator-talents/paizo-investigator-talents/amazing-inspiration/

// When using inspiration, the investigator rolls a d8 instead of a d6. At 20th level, the investigator rolls 2d8 and adds both dice to the result.

import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { itemHasCompendiumId } from '../../util/has-compendium-id.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { localize, localizeBonusTooltip } from '../../util/localize.mjs';
import { onCreate } from '../../util/on-create.mjs';
import { LanguageSettings } from '../../util/settings.mjs';
import { SpecificBonus } from '../_specific-bonus.mjs';
import { Inspiration } from './inspiration.mjs';

const compendiumId = '3ggXCz7WmYP55vu5';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#inspiration';

export class InspirationAmazing extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'inspiration-amazing'; }

    /** @inheritdoc @override */
    static get journal() { return journal; }

    /** @inheritdoc @override */
    static get parent() { return Inspiration.key; }
}
class Settings {
    static get inpsirationAmazing() { return LanguageSettings.getTranslation(InspirationAmazing.key); }

    static {
        LanguageSettings.registerItemNameTranslation(InspirationAmazing.key);
    }
}

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const has = !!item.hasItemBooleanFlag(InspirationAmazing.key);
    if (!has) {
        return;
    }

    const hint = hintcls.create('', [], { hint: localizeBonusTooltip(InspirationAmazing.key), icon: 'fas fa-magnifying-glass ckl-extra-focus' });
    return hint;
});

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const hasFlag = item.hasItemBooleanFlag(InspirationAmazing.key);
    if (!hasFlag) {
        const name = item?.name?.toLowerCase() ?? '';
        const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
        if (isEditable && (name === Settings.inpsirationAmazing || hasCompendiumId)) {
            item.addItemBooleanFlag(InspirationAmazing.key);
        }
        return;
    }

    const die = item.actor?.getRollData().rb?.inspiration?.base;

    showEnabledLabel({
        item,
        journal,
        key: InspirationAmazing.key,
        parent: html,
        text: localize('inspiration-amazing-die', { die }),
    }, {
        canEdit: isEditable,
        inputType: 'specific-bonus',
    });
});

onCreate(compendiumId, () => Settings.inpsirationAmazing, { booleanKeys: InspirationAmazing.key });
