import { Sources } from '../source-registration.mjs';
import { AgileBonus } from './agile.mjs';
import { AttackBonus } from "./attack-bonus.mjs";
import { BaneBonus } from './bane-bonus.mjs';
import { CasterLevelBonus } from './caster-level-bonus.mjs';
import { InitiativeBonus } from './conditional-bonuses.mjs/initiative-bonus.mjs';
import { SaveBonus } from './conditional-bonuses.mjs/save-bonus.mjs';
import { SkillBonus } from './conditional-bonuses.mjs/skill-bonus.mjs';
import { ConditionalModifiersBonus } from './conditional-modifiers-bonus.mjs';
import { CritBonus } from './crit-bonus.mjs';
import { DamageBonus } from "./damage-bonus.mjs";
import { DCBonus } from './dc-bonus.mjs';
import { DiceTransformBonus } from './dice-transform-bonus.mjs';
import { EffectiveSizeBonus } from './effective-size-bonus.mjs';
import { EnhancementBonus } from './enhancement-bonus.mjs';
import { FinesseBonus } from './finesse-bonus.mjs';
import { FootnoteBonus } from './footnote-bonus.mjs';
import { FortuneBonus } from './fortune-bonus.mjs';
import { MaximizeDamageBonus } from './maximize-damage-bonus.mjs';
import { MisfortuneBonus } from './misfortune-bonus.mjs';
import { ScriptCallBonus } from './script-call-bonus.mjs';

export const registerBonuses = () => [
    // action bonuses
    AgileBonus,
    AttackBonus,
    BaneBonus,
    CasterLevelBonus,
    ConditionalModifiersBonus,
    CritBonus,
    DamageBonus,
    DCBonus,
    DiceTransformBonus,
    EffectiveSizeBonus,
    EnhancementBonus,
    FinesseBonus,
    FootnoteBonus,
    FortuneBonus,
    MisfortuneBonus,
    ScriptCallBonus,

    // conditional bonuses
    InitiativeBonus,
    SaveBonus,
    SkillBonus,

    // Specifically last so it'll include other damage bonuses in its tooltip
    MaximizeDamageBonus,
].forEach(Sources.registerSource);
