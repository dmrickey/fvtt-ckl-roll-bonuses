import { SpecificBonus } from '../../../bonuses/_specific-bonus.mjs';
import { showEnabledLabel } from '../../../handlebars-handlers/enabled-label.mjs';
import { LanguageSettings } from '../../../util/settings.mjs';

export class PreciseShot extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'precise-shot'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.4A4bCh8VsQVbTsAY#precise-shot-bonus'; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: '53urYIbYYpQuoSLd',
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
    static get name() { return LanguageSettings.getTranslation(PreciseShot.key); }

    static {
        LanguageSettings.registerItemNameTranslation(PreciseShot.key);
    }
}
