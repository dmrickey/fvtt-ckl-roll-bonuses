import { SpecificBonus } from '../_specific-bonus.mjs';
import { MODULE_NAME } from '../../consts.mjs';
import { LanguageSettings } from '../../util/settings.mjs';

export class PackFlanking extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'pack-flanking'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#pack-flanking-(feat)'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {string} actorUuid
     * @returns {Promise<void>}
     */
    static async configure(item, actorUuid) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: { [MODULE_NAME]: { [this.key]: actorUuid } },
        });
    }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
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
