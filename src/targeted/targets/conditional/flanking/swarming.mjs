import { SpecificBonus } from '../../../../bonuses/_specific-bonus.mjs';
import { showEnabledLabel } from '../../../../handlebars-handlers/enabled-label.mjs';
import { LanguageSettings } from '../../../../util/settings.mjs';

export class Swarming extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'swarming'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#swarming-(ratfolk-racial-ability)'; }

    /** @inheritdoc @override @returns {RenderAndCreateConfigure} */
    static get configuration() {
        return {
            type: 'render-and-create-configure',
            itemFilter: (item) => item instanceof pf1.documents.item.ItemPF,
            compendiumId: 'fyRBxVBVyy1gQgfV',
            isItemMatchFunc: name => name === Settings.name,
            showInputsFunc: (item, html, isEditable) => showEnabledLabel({
                item,
                journal: this.journal,
                key: this.key,
                parent: html,
            }, {
                canEdit: isEditable,
                inputType: 'specific-bonus',
            }),
        };
    }
}

class Settings {
    static get name() { return LanguageSettings.getTranslation(Swarming.key); }

    static {
        LanguageSettings.registerItemNameTranslation(Swarming.key);
    }
}
