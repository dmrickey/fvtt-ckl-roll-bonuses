import { FinesseBonus } from '../targeted/bonuses/finesse-bonus.mjs';
import { FinesseTarget } from '../targeted/targets/finesse-target.mjs';
import { onRenderCreate } from '../util/on-create.mjs';
import { LanguageSettings } from '../util/settings.mjs';

const compendiumId = 'vWiTqHC4Y3Xn1Pme';

class Settings {
    static key = 'weapon-finesse';
    static get name() { return LanguageSettings.getTranslation(this.key); }

    static {
        LanguageSettings.registerItemNameTranslation(this.key);
    }
}

onRenderCreate(
    FinesseBonus.key,
    compendiumId,
    (name) => name === Settings.name,
);
onRenderCreate(
    FinesseTarget.key,
    compendiumId,
    (name) => name === Settings.name,
);
