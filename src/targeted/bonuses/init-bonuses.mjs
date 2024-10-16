import { Sources } from '../source-registration.mjs';
import { AgileBonus } from './agile.mjs';
import { AttackBonus } from "./attack-bonus.mjs";
import { CasterLevelBonus } from './caster-level-bonus.mjs';
import { CritBonus } from './crit-bonus.mjs';
import { DamageBonus } from "./damage-bonus.mjs";
import { DCBonus } from './dc-bonus.mjs';
import { EffectiveSizeBonus } from './effective-size.mjs';
import { EnhancementBonus } from './enhancement-bonus.mjs';
import { FinesseBonus as FinesseBonus } from './finesse-bonus.mjs';
import { FootnoteBonus } from './footnote-bonus.mjs';
import { FortuneBonus } from './fortune-bonus.mjs';
import { MaximizeDamageBonus } from './maximize-damage-bonus.mjs';
import { MisfortuneBonus } from './misfortune-bonus.mjs';
import { ModifiersBonus } from './unused/modifiers.mjs';

export const registerBonuses = () => [
    AgileBonus,
    AttackBonus,
    CasterLevelBonus,
    CritBonus,
    DamageBonus,
    DCBonus,
    EffectiveSizeBonus,
    EnhancementBonus,
    FinesseBonus,
    FootnoteBonus,
    FortuneBonus,
    MisfortuneBonus,
    ModifiersBonus, // only if I can get the function to remove duplicates working (which needs to work with conditionals)

    // Specifically last so it'll include other damage bonuses in its tooltip
    MaximizeDamageBonus,
].forEach(Sources.registerSource);
