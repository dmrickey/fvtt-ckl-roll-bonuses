import { registerSetting } from '../util/settings.mjs';
import { MODULE_NAME } from '../consts.mjs';
import { FinesseBonus } from '../targeted/bonuses/finesse-bonus.mjs';
import { FinesseTarget } from '../targeted/targets/finesse-target.mjs';

const compendiumId = 'vWiTqHC4Y3Xn1Pme';
const key = 'weapon-finesse';
const bonusKey = FinesseBonus.key;
const targetKey = FinesseTarget.key;

registerSetting({ key: key });

class Settings {
    static get name() { return Settings.#getSetting(key); }
    // @ts-ignore
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key).toLowerCase(); }
}

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const name = item?.name?.toLowerCase() ?? '';
    const sourceId = item?.flags.core?.sourceId ?? '';
    const hasBonus = item.system.flags.boolean?.hasOwnProperty(bonusKey);
    const hasBonusFormula = item.system.flags.boolean?.hasOwnProperty(targetKey);

    if ((name === Settings.name || sourceId.includes(compendiumId)) && !hasBonus && !hasBonusFormula) {
        item.update({
            [`system.flags.boolean.${bonusKey}`]: true,
            [`system.flags.boolean.${targetKey}`]: true,
        });
    }
});
