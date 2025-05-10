import { SpecificBonus } from '../../../../bonuses/_specific-bonus.mjs';
import { LanguageSettings } from '../../../../util/settings.mjs';

export class PackFlanking extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'pack-flanking'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#pack-flanking-(feat)'; }

    /** @inheritdoc @override @returns {RenderAndCreateConfigure} */
    static get configuration() {
        return {
            type: 'render-and-create-configure',
            itemFilter: (item) => item instanceof pf1.documents.item.ItemPF,
            compendiumId: 'TGUFjwD7G8iBPRXc',
            isItemMatchFunc: name => name.includes(Settings.name),
            showInputsFunc: (item, html, isEditable) => {
                // TODO - show actor picker for specific actor
            },
        };
    }
}

class Settings {
    static get name() { return LanguageSettings.getTranslation(PackFlanking.key); }

    static {
        LanguageSettings.registerItemNameTranslation(PackFlanking.key);
    }
}
