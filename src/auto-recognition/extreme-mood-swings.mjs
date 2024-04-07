import { LanguageSettings } from '../util/settings.mjs';
import { bonusKey, formulaKey } from '../bonuses/change-type-offset.mjs';

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

    const name = item?.name?.toLowerCase() ?? '';
    const sourceId = item?.flags.core?.sourceId ?? '';
    const hasBonus = item.system.flags.dictionary?.hasOwnProperty(bonusKey);
    const hasBonusFormula = item.system.flags.dictionary?.hasOwnProperty(formulaKey);

    if ((name === Settings.name || sourceId.includes(compendiumId)) && !hasBonus && !hasBonusFormula) {
        item.update({
            [`system.flags.dictionary.${bonusKey}`]: 'morale',
            [`system.flags.dictionary.${formulaKey}`]: 1,
        });
    }
});
