import { SpecificBonus } from '../../../../bonuses/_specific-bonus.mjs';
import { showEnabledLabel } from '../../../../handlebars-handlers/enabled-label.mjs';
import { registerItemHint } from '../../../../util/item-hints.mjs';
import { LanguageSettings } from '../../../../util/settings.mjs';

export class Outflank extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'outflank'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.4A4bCh8VsQVbTsAY#outflank'; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'ln2Dhw97Fol1BCxU',
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

    static get defaultName() { return Settings.name; }
}

// register hint on source ability
registerItemHint((hintcls, _actor, item, _data) => {
    const has = Outflank.has(item);
    if (has) {
        return hintcls.create('', [], { icon: 'ra ra-dervish-swords', hint: Outflank.tooltip });
    }
});

class Settings {
    static get name() { return LanguageSettings.getTranslation(Outflank.key); }

    static {
        LanguageSettings.registerItemNameTranslation(Outflank.key);
    }
}
