import { SpecificBonus } from '../_specific-bonus.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { LanguageSettings } from '../../util/settings.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';

export class Swarming extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'swarming'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#swarming-(ratfolk-racial-ability)'; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
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

// register hint on source ability
registerItemHint((hintcls, _actor, item, _data) => {
    const has = Swarming.has(item);
    if (has) {
        return hintcls.create('', [], { hint: Swarming.tooltip, icon: 'ra ra-double-team' });
    }
});

class Settings {
    static get name() { return LanguageSettings.getTranslation(Swarming.key); }

    static {
        LanguageSettings.registerItemNameTranslation(Swarming.key);
    }
}
