import { CritBonus } from '../targeted/bonuses/crit-bonus.mjs';
import { WeaponTypeTarget } from '../targeted/targets/weapon-type-target.mjs';
import { getWeaponTypesFromActor } from '../util/get-weapon-types-from-actor.mjs';
import { onRenderCreate } from '../util/on-create.mjs';
import { LanguageSettings } from '../util/settings.mjs';

const compendiumId = 'TbOPtIL8Fv8obXtP';

class Settings {
    static key = 'improved-critical';
    static get name() { return LanguageSettings.getTranslation(this.key); }

    static {
        LanguageSettings.registerItemNameTranslation(this.key);
    }
}

onRenderCreate(
    WeaponTypeTarget.key,
    compendiumId,
    (name) => name === Settings.name,
    {
        defaultFlagValuesFunc: (item) => {
            const actor = item?.actor;
            if (!actor) return;

            const choices = getWeaponTypesFromActor(actor);
            if (choices.length) {
                return {
                    [WeaponTypeTarget.key]: [choices[0]],
                    [CritBonus.critKeenKey]: true,
                };
            }
        },
        extraBooleanFlags: [CritBonus.key],
    }
);
