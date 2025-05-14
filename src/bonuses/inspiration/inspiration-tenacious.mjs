// https://www.d20pfsrd.com/classes/hybrid-classes/investigator/investigator-talents/paizo-investigator-talents/tenacious-inspiration-ex

// When an investigator rolls his inspiration die, he can roll an additional inspiration die and take the higher result.

import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { localizeBonusTooltip } from '../../util/localize.mjs';
import { LanguageSettings } from '../../util/settings.mjs';
import { SpecificBonus } from '../_specific-bonus.mjs';
import { Inspiration } from './inspiration.mjs';

export class InspirationTenacious extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'inspiration-tenacious'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#inspiration'; }

    /** @inheritdoc @override */
    static get parent() { return Inspiration.key; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'L1Xj4ZQ48ap20hSw',
            isItemMatchFunc: (name) => name === Settings.name,
            showInputsFunc: (item, html, isEditable) => {
                showEnabledLabel({
                    item,
                    journal: this.journal,
                    key: this.key,
                    parent: html,
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
        };
    }
}
class Settings {
    static get name() { return LanguageSettings.getTranslation(InspirationTenacious.key); }

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
