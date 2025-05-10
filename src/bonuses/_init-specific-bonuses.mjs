import { onRenderCreate } from '../util/on-create.mjs';
import { SpecificBonus } from './_specific-bonus.mjs';
import { ArmorFocus } from './armor-focus/armor-focus.mjs';
import { ArmorFocusImproved } from './armor-focus/improved-armor-focus.mjs';
import { ChangeTypeModification } from './change-type-modification.mjs';
import { FatesFavored } from './fates-favored.mjs';
import { FuriousFocus } from './furious-focus.mjs';
import { InspirationAmazing } from './inspiration/inspiration-amazing.mjs';
import { InspirationExtraDie } from './inspiration/inspiration-extra-die.mjs';
import { InspirationFocused } from './inspiration/inspiration-focused.mjs';
import { InspirationTenacious } from './inspiration/inspiration-tenacious.mjs';
import { InspirationTrue } from './inspiration/inspiration-true.mjs';
import { Inspiration } from './inspiration/inspiration.mjs';
import { MartialFocus } from './martial-focus.mjs';
import { RollSkillUntrained } from './roll-untrained.mjs';
import { SkillRankOverride } from './skill-rank-override.mjs';
import { SnakeSidewind } from './snake-sidewind.mjs';
import { ElementalCl, ElementalDc } from './spells/base-elemental-cl-dc.mjs';
import { ElementalFocus, ElementalFocusGreater, ElementalFocusMythic } from './spells/elemental-focus.mjs';
import { SpellFocus, SpellFocusGreater, SpellFocusMythic } from './spells/spell-focus.mjs';
import { SpellSpecialization } from './spells/spell-specialization.mjs';
import { VersatilePerformance, VersatilePerformanceExpanded } from './versatile-performance.mjs';
import { VersatileTraining } from './versatile-training.mjs';
import { DevastatingStrike, DevastatingStrikeImproved } from './vital-strike/devastating-strike.mjs';
import { VitalStrike, VitalStrikeGreater, VitalStrikeImproved, VitalStrikeMythic } from './vital-strike/vital-strike.mjs';
import { WeaponFocus, WeaponFocusGreater, WeaponFocusMythic, WeaponFocusRacial } from './weapon-focus/_base-weapon-focus.mjs';
import { WeaponSpecializationGreater } from './weapon-specialization/greater-weapon-specialization.mjs';
import { WeaponSpecialization } from './weapon-specialization/weapon-specialization.mjs';

// import logic for joint handling
import './inspiration/_inspiration-join.mjs';
import './armor-focus/shared.mjs';

const allSpecificBonuses = [
    ArmorFocus,
    ArmorFocusImproved,
    ChangeTypeModification,
    DevastatingStrike,
    DevastatingStrikeImproved,
    ElementalCl,
    ElementalDc,
    ElementalFocus,
    ElementalFocusGreater,
    ElementalFocusMythic,
    Inspiration,
    InspirationAmazing,
    InspirationExtraDie,
    InspirationFocused,
    InspirationTenacious,
    InspirationTrue,
    FatesFavored,
    FuriousFocus,
    MartialFocus,
    RollSkillUntrained,
    SkillRankOverride,
    SnakeSidewind,
    SpellFocus,
    SpellFocusGreater,
    SpellFocusMythic,
    SpellSpecialization,
    VersatilePerformance,
    VersatilePerformanceExpanded,
    VersatileTraining,
    VitalStrike,
    VitalStrikeGreater,
    VitalStrikeImproved,
    VitalStrikeMythic,
    WeaponFocus,
    WeaponFocusGreater,
    WeaponFocusMythic,
    WeaponFocusRacial,
    WeaponSpecialization,
    WeaponSpecializationGreater,
];

export const initSpecificBonuses = () => {
    allSpecificBonuses.forEach(x => x.register());
    allSpecificBonuses.forEach((bonus) => {
        try {
            const config = bonus.configuration;
            switch (config.type) {
                case 'just-render':
                    onRender(bonus.key, config.showInputsFunc);
                    break;
                case 'render-and-create':
                    onRenderCreate(
                        config.itemFilter,
                        bonus.key,
                        config.compendiumId,
                        config.isItemMatchFunc,
                        config.showInputsFunc,
                        {
                            extraBooleanFlags: config.options?.extraBooleanFlags,
                            defaultFlagValuesFunc: config.options?.defaultFlagValuesFunc,
                        }
                    );
                    break;
                default: throw new Error('new configuration type was added and this switch statement wasn\'t updated');
            }
        }
        catch {
            console.error(`Bonus '${bonus.prototype.constructor.name} :: ${bonus.key}' has not been migrated yet.`);
        }
    })
}

/**
 * @param {string} key
 * @param {ShowInputsFunc} showInputsFunc
 */
const onRender = (key, showInputsFunc) => {
    Hooks.on(
        'renderItemSheet',
        (
            /** @type {ItemSheetPF} */ { isEditable, item },
            /** @type {[HTMLElement]} */[html],
            /** @type {unknown} */ _data
        ) => {
            if (item.hasItemBooleanFlag(key)) {
                showInputsFunc(item, html, isEditable);
            }
        }
    );
};
