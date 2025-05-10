// https://www.d20pfsrd.com/classes/hybrid-classes/investigator/investigator-talents/paizo-investigator-talents/tenacious-inspiration-ex

// When an investigator rolls his inspiration die, he can roll an additional inspiration die and take the higher result.

import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { itemHasCompendiumId } from '../../util/has-compendium-id.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { localizeBonusTooltip } from '../../util/localize.mjs';
import { onCreate } from '../../util/on-create.mjs';
import { LanguageSettings } from '../../util/settings.mjs';
import { SpecificBonus } from '../_specific-bonus.mjs';
import { Inspiration } from './inspiration.mjs';

const compendiumId = 'L1Xj4ZQ48ap20hSw';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#inspiration';

export class InspirationTenacious extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'inspiration-tenacious'; }

    /** @inheritdoc @override */
    static get journal() { return journal; }

    /** @inheritdoc @override */
    static get parent() { return Inspiration.key; }
}
class Settings {
    static get inpsirationTenacious() { return LanguageSettings.getTranslation(InspirationTenacious.key); }

    static {
        LanguageSettings.registerItemNameTranslation(InspirationTenacious.key);
    }
}

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const has = !!item.hasItemBooleanFlag(InspirationTenacious.key);
    if (!has) {
        return;
    }

    const hint = hintcls.create('', [], { hint: localizeBonusTooltip(InspirationTenacious.key), icon: 'fas fa-magnifying-glass ckl-extra-fa-magnifying-glass' });
    return hint;
});

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const hasFlag = item.hasItemBooleanFlag(InspirationTenacious.key);
    if (!hasFlag) {
        const name = item?.name?.toLowerCase() ?? '';
        const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
        if (isEditable && (name === Settings.inpsirationTenacious || hasCompendiumId)) {
            item.addItemBooleanFlag(InspirationTenacious.key);
        }
        return;
    }

    showEnabledLabel({
        item,
        journal,
        key: InspirationTenacious.key,
        parent: html,
    }, {
        canEdit: isEditable,
        inputType: 'specific-bonus',
    });
});

onCreate(
    compendiumId,
    () => Settings.inpsirationTenacious,
    { booleanKeys: InspirationTenacious.key },
);
