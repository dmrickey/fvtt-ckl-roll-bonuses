import { ArmorFocus } from './armor-focus/armor-focus.mjs';
import { ArmorFocusImproved } from './armor-focus/improved-armor-focus.mjs';
import { ChangeTypeModification } from './change-type-modification.mjs';
import { FatesFavored } from './fates-favored.mjs';
import { FlankingImmunity } from './flanking/flanking-immunity.mjs';
import { GangUp } from './flanking/gang-up.mjs';
import { OutflankImproved } from './flanking/outflank-improved.mjs';
import { PackFlanking } from './flanking/pack-flanking.mjs';
import { Swarming } from './flanking/swarming.mjs';
import { UncannyDodgeImproved } from './flanking/uncanny-dodge-improved.mjs';
import { UnderfootAssault } from './flanking/underfoot-assault.mjs';
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
import { SoloTactics } from './solo-tactics.mjs';
import { ElementalCl, ElementalDc } from './spells/base-elemental-cl-dc.mjs';
import { ElementalFocus, ElementalFocusGreater, ElementalFocusMythic } from './spells/elemental-focus.mjs';
import { SpellFocus, SpellFocusGreater, SpellFocusMythic } from './spells/spell-focus.mjs';
import { SpellSpecialization } from './spells/spell-specialization.mjs';
import { VersatilePerformance, VersatilePerformanceExpanded } from './versatile-performance.mjs';
import { VersatileTraining } from './versatile-training.mjs';
import { DevastatingStrike, DevastatingStrikeImproved } from './vital-strike/devastating-strike.mjs';
import { VitalStrike, VitalStrikeGreater, VitalStrikeImproved, VitalStrikeMythic } from './vital-strike/vital-strike.mjs';
import { WeaponFocus, WeaponFocusGreater, WeaponFocusMythic, WeaponFocusRacial } from './weapon-focus/weapon-focus.mjs';
import { WeaponSpecializationGreater } from './weapon-specialization/greater-weapon-specialization.mjs';
import { WeaponSpecialization } from './weapon-specialization/weapon-specialization.mjs';

// import logic for joint handling
import './armor-focus/shared.mjs';
import './inspiration/_inspiration-join.mjs';
import './weapon-focus/_weapon-focus-shared.mjs';

// separate because its deprecated
import './skills/init.mjs';

/**
 * Array of all bonuses that are always on
 * @see SpecificBonus
 */
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
    FatesFavored,
    FlankingImmunity,
    FuriousFocus,
    GangUp,
    Inspiration,
    InspirationAmazing,
    InspirationExtraDie,
    InspirationFocused,
    InspirationTenacious,
    InspirationTrue,
    MartialFocus,
    OutflankImproved,
    PackFlanking,
    RollSkillUntrained,
    SkillRankOverride,
    SnakeSidewind,
    SoloTactics,
    SpellFocus,
    SpellFocusGreater,
    SpellFocusMythic,
    SpellSpecialization,
    Swarming,
    UncannyDodgeImproved,
    UnderfootAssault,
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

export const initSpecificBonuses = () => allSpecificBonuses.forEach(x => x.register());
