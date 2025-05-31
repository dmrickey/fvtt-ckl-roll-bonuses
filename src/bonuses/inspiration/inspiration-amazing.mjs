// https://www.d20pfsrd.com/classes/hybrid-classes/investigator/investigator-talents/paizo-investigator-talents/amazing-inspiration/

// When using inspiration, the investigator rolls a d8 instead of a d6. At 20th level, the investigator rolls 2d8 and adds both dice to the result.

import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { localize, localizeBonusTooltip } from '../../util/localize.mjs';
import { LanguageSettings } from '../../util/settings.mjs';
import { SpecificBonus } from '../_specific-bonus.mjs';
import { Inspiration } from './inspiration.mjs';

export class InspirationAmazing extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'inspiration-amazing'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#inspiration'; }

    /** @inheritdoc @override */
    static get parent() { return Inspiration.key; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: '3ggXCz7WmYP55vu5',
            isItemMatchFunc: (name) => name === Settings.name,
            showInputsFunc: (item, html, isEditable) => {
                const die = item.actor?.getRollData().rb?.inspiration?.base;
                showEnabledLabel({
                    item,
                    journal: this.journal,
                    key: this.key,
                    parent: html,
                    text: localize('inspiration-amazing-die', { die }),
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
        };
    }
}
class Settings {
    static get name() { return LanguageSettings.getTranslation(InspirationAmazing.key); }

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
