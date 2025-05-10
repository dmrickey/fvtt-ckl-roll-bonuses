import { ChangeTypeModification } from '../bonuses/change-type-modification.mjs';
import { onRenderCreate } from '../util/on-create.mjs';
import { LanguageSettings } from '../util/settings.mjs';

class Settings {
    static get #key() { return 'extreme-mood-swings'; }
    static get name() { return LanguageSettings.getTranslation(this.#key); }

    static {
        LanguageSettings.registerItemNameTranslation(this.#key);
    }
}

onRenderCreate(
    (item) => item instanceof pf1.documents.item.ItemPF,
    ChangeTypeModification.key,
    'WSRZEwNGpQUNcvI9',
    (name) => name === Settings.name,
    {
        defaultFlagValuesFunc: () => ({
            [ChangeTypeModification.changeTypeKey]: 'morale',
            [ChangeTypeModification.formulaKey]: 1,
        }),
    }
);