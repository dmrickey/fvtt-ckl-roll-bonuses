import { SpecificBonus } from '../../../bonuses/_specific-bonus.mjs';
import { showEnabledLabel } from '../../../handlebars-handlers/enabled-label.mjs';
import { onRenderCreate } from '../../../util/on-create.mjs';
import { LanguageSettings } from '../../../util/settings.mjs';

const compendiumId = '53urYIbYYpQuoSLd';
export const key = 'precise-shot';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.4A4bCh8VsQVbTsAY#precise-shot-bonus';

class Settings {
    static get name() { return LanguageSettings.getTranslation(key); }

    static {
        LanguageSettings.registerItemNameTranslation(key);
    }
}

onRenderCreate(
    (item) => item instanceof pf1.documents.item.ItemPF,
    key,
    compendiumId,
    name => name === Settings.name,
    {
        showInputsFunc: (item, html, isEditable) => showEnabledLabel({
            item,
            journal,
            key,
            parent: html,
        }, {
            canEdit: isEditable,
            inputType: 'specific-bonus',
        }),
    }
);

export class PreciseShot extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return key; }

    /** @inheritdoc @override */
    static get journal() { return journal; }
}
