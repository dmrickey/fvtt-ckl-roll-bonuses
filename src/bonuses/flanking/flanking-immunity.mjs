import { SpecificBonus } from '../_specific-bonus.mjs';
import { LanguageSettings } from '../../util/settings.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';

export class FlankingImmunity extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'flanking-immunity'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#pack-flanking-(feat)'; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'hRdJOHAkJd2G3ScN',
            isItemMatchFunc: name => name.includes(Settings.name),
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

// register hint on source ability
registerItemHint((hintcls, _actor, item, _data) => {
    const has = FlankingImmunity.has(item);
    if (has) {
        return hintcls.create(FlankingImmunity.label, [], { icon: 'ra ra-eyeball', hint: FlankingImmunity.tooltip, combo: true });
    }
});

class Settings {
    static get name() { return LanguageSettings.getTranslation(FlankingImmunity.key); }

    static {
        LanguageSettings.registerItemNameTranslation(FlankingImmunity.key);
    }
}
