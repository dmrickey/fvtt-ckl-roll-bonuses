import { SpecificBonus } from '../_specific-bonus.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { LanguageSettings } from '../../util/settings.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';

export class UnderfootAssault extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'underfoot-assault'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#underfoot-assault-(mouser-swashbuckler-archetype)'; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'ks7p3n3LbKuVuFiD',
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
    const has = UnderfootAssault.has(item);
    if (has) {
        return hintcls.create('', [], { hint: UnderfootAssault.tooltip, icon: 'fas fa-shoe-prints' });
    }
});

class Settings {
    static get name() { return LanguageSettings.getTranslation(UnderfootAssault.key); }

    static {
        LanguageSettings.registerItemNameTranslation(UnderfootAssault.key);
    }
}
