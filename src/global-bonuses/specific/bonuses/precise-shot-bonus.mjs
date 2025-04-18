import { SpecificBonuses } from '../../../bonuses/_all-specific-bonuses.mjs';
import { showEnabledLabel } from '../../../handlebars-handlers/enabled-label.mjs';
import { itemHasCompendiumId } from '../../../util/has-compendium-id.mjs';
import { LanguageSettings } from '../../../util/settings.mjs';

const compendiumId = '53urYIbYYpQuoSLd';
export const key = 'precise-shot';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.4A4bCh8VsQVbTsAY#precise-shot-bonus';

export const init = () => {
    SpecificBonuses.registerSpecificBonus({ journal, key });
};

class Settings {
    static get name() { return LanguageSettings.getTranslation(key); }

    static {
        LanguageSettings.registerItemNameTranslation(key);
    }
}

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!isEditable) return;
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const name = item?.name?.toLowerCase() ?? '';
    const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
    const hasBonus = item.hasItemBooleanFlag(key);

    if ((name === Settings.name || hasCompendiumId) && !hasBonus) {
        item.addItemBooleanFlag(key);
    }

    if (hasBonus) {
        showEnabledLabel({
            item,
            journal,
            key,
            parent: html,
        }, {
            canEdit: isEditable,
            inputType: 'specific-bonus',
        });
    }
});

/**
 * @param {ItemPF} item
 * @param {object} data
 * @param {{temporary: boolean}} param2
 * @param {string} id
 */
const onCreate = (item, data, { temporary }, id) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;
    if (temporary) return;

    const name = item?.name?.toLowerCase() ?? '';
    const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
    const hasBonus = item.hasItemBooleanFlag(key);

    if ((name === Settings.name || hasCompendiumId) && !hasBonus) {
        item.updateSource({
            [`system.flags.boolean.${key}`]: true,
        });
    }
};
Hooks.on('preCreateItem', onCreate);
