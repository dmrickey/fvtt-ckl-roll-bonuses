// https://www.d20pfsrd.com/classes/hybrid-classes/investigator/investigator-talents/paizo-investigator-talents/tenacious-inspiration-ex

// When an investigator rolls his inspiration die, he can roll an additional inspiration die and take the higher result.

import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { itemHasCompendiumId } from '../../util/has-compendium-id.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { localizeBonusTooltip } from '../../util/localize.mjs';
import { onCreate } from '../../util/on-create.mjs';
import { SpecificBonuses } from '../_all-specific-bonuses.mjs';
import { inspirationTenaciousKey as key, inspirationKey, InspirationLanguageSettings } from './_base-inspiration.mjs';

const compendiumId = 'L1Xj4ZQ48ap20hSw';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#inspiration';

SpecificBonuses.registerSpecificBonus({ journal, key, parent: inspirationKey });

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const has = !!item.hasItemBooleanFlag(key);
    if (!has) {
        return;
    }

    const hint = hintcls.create('', [], { hint: localizeBonusTooltip(key), icon: 'fas fa-magnifying-glass ckl-extra-fa-magnifying-glass' });
    return hint;
});

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
        if (isEditable && (name === InspirationLanguageSettings.inpsirationTenacious || hasCompendiumId)) {
            item.addItemBooleanFlag(key);
        }
        return;
    }

    showEnabledLabel({
        journal,
        key,
        item,
        parent: html,
    }, {
        canEdit: isEditable,
        inputType: 'specific-bonus',
    });
});

onCreate(
    compendiumId,
    () => InspirationLanguageSettings.inpsirationTenacious,
    { booleanKeys: key },
);
