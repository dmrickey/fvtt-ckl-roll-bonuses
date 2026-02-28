import { SpecificBonus } from '../../../bonuses/_specific-bonus.mjs';
import { showEnabledLabel } from '../../../handlebars-handlers/enabled-label.mjs';
import { LanguageSettings } from '../../../util/settings.mjs';

export class SpiritedCharge extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'spirited-charge'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.4A4bCh8VsQVbTsAY#spirited-charge'; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'jKVhOxHu6VmUgFdp',
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
    static get name() { return LanguageSettings.getTranslation(SpiritedCharge.key); }

    static {
        LanguageSettings.registerItemNameTranslation(SpiritedCharge.key);
    }
}
