import { changeKey, changeTypeOffsetFormulaKey, changeTypeKey } from '../bonuses/change-type-modification.mjs';
import { MODULE_NAME } from '../consts.mjs';
import { LanguageSettings } from '../util/settings.mjs';

const compendiumId = 'WSRZEwNGpQUNcvI9';
const key = 'extreme-mood-swings';

class Settings {
    static get name() { return LanguageSettings.getTranslation(key); }

    static {
        LanguageSettings.registerItemNameTranslation(key);
    }
}

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!isEditable) return;
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const hasBonus = item.hasItemBooleanFlag(changeKey);

    if (!hasBonus) {
        const name = item?.name?.toLowerCase() ?? '';
        const sourceId = item?.flags.core?.sourceId ?? '';
        if (name === Settings.name || sourceId.includes(compendiumId)) {
            item.update({
                [`system.flags.boolean.${changeKey}`]: true,
                [`flags.${MODULE_NAME}.${changeTypeKey}`]: 'morale',
                [`flags.${MODULE_NAME}.${changeTypeOffsetFormulaKey}`]: 1,
            });
        }
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
    const sourceId = item?.flags.core?.sourceId ?? '';

    if (name === Settings.name || sourceId.includes(compendiumId)) {
        item.updateSource({
            [`system.flags.boolean.${changeKey}`]: true,
            [`flags.${MODULE_NAME}.${changeTypeKey}`]: 'morale',
            [`flags.${MODULE_NAME}.${changeTypeOffsetFormulaKey}`]: 1,
        });
    }
};
Hooks.on('preCreateItem', onCreate);
