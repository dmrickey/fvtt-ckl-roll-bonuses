import { changeTypeOffsetFormulaKey, changeTypeOffsetKey } from '../bonuses/change-type-offset.mjs';
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

    const hasBonus = item.hasItemBooleanFlag(changeTypeOffsetKey);

    if (!hasBonus) {
        const name = item?.name?.toLowerCase() ?? '';
        const sourceId = item?.flags.core?.sourceId ?? '';
        if (!(name === Settings.name || sourceId.includes(compendiumId))) {
            item.update({
                [`system.flags.boolean.${changeTypeOffsetKey}`]: true,
                [`flags.${MODULE_NAME}.${changeTypeOffsetKey}`]: 'morale',
                [`flags.${MODULE_NAME}.${changeTypeOffsetFormulaKey}`]: 1,
            });
        }
    }
});
