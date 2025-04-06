import { LanguageSettings } from '../util/settings.mjs';
import { FinesseBonus } from '../targeted/bonuses/finesse-bonus.mjs';
import { FinesseTarget } from '../targeted/targets/finesse-target.mjs';
import { itemHasCompendiumId } from '../util/has-compendium-id.mjs';

const compendiumId = 'vWiTqHC4Y3Xn1Pme';
const bonusKey = FinesseBonus.key;
const targetKey = FinesseTarget.key;

class Settings {
    static key = 'weapon-finesse';
    static get name() { return LanguageSettings.getTranslation(this.key); }

    static {
        LanguageSettings.registerItemNameTranslation(this.key);
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
    const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
    const hasBonus = item.hasItemBooleanFlag(bonusKey);
    const hasBonusFormula = item.hasItemBooleanFlag(targetKey);

    if ((name === Settings.name || hasCompendiumId) && !hasBonus && !hasBonusFormula) {
        item.update({
            [`system.flags.boolean.${bonusKey}`]: true,
            [`system.flags.boolean.${targetKey}`]: true,
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

    if (name === Settings.name || hasCompendiumId) {
        item.updateSource({
            [`system.flags.boolean.${bonusKey}`]: true,
            [`system.flags.boolean.${targetKey}`]: true,
        });
    }
};
Hooks.on('preCreateItem', onCreate);
