import { SpecificBonus } from '../_specific-bonus.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { LanguageSettings } from '../../util/settings.mjs';
import { Outflank } from '../../global-bonuses/specific/bonuses/flanking/outflank.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';

export class OutflankImproved extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'outflank-improved'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#improved-outflank-(feat)'; }

    /** @inheritdoc @override */
    static get parent() { return Outflank.key; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'OYKXMl4diLeGyifQ',
            isItemMatchFunc: name => LanguageSettings.isImproved(name, Outflank.defaultName),
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
    const has = OutflankImproved.has(item);
    if (has) {
        return hintcls.create('', [], { hint: OutflankImproved.tooltip, icon: 'ra ra-dervish-swords improved-icon' });
    }
});
