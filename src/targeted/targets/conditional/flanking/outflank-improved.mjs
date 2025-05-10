import { SpecificBonus } from '../../../../bonuses/_specific-bonus.mjs';
import { showEnabledLabel } from '../../../../handlebars-handlers/enabled-label.mjs';
import { LanguageSettings } from '../../../../util/settings.mjs';
import { Outflank } from '../../../../global-bonuses/specific/bonuses/flanking/outflank.mjs';

export class OutflankImproved extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'outflank-improved'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#improved-outflank-(feat)'; }

    /** @inheritdoc @override */
    static get parent() { return Outflank.key; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            itemFilter: (item) => item instanceof pf1.documents.item.ItemPF,
            compendiumId: 'OYKXMl4diLeGyifQ',
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
    static get name() { return LanguageSettings.getTranslation(OutflankImproved.key); }

    static {
        LanguageSettings.registerItemNameTranslation(OutflankImproved.key);
    }
}
