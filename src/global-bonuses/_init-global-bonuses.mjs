import { GlobalBonuses } from './all-global-bonuses.mjs';
import { DamageMultiplierGlobalBonus } from './damage-multiplier-global-bonus.mjs';
import { FlankingGlobalBonus } from './flanking-global-bonus.mjs';
import { HigherGroundGlobalBonus } from './higher-ground-global-bonus.mjs';
import { RangedIncrementPenaltyGlobalBonus } from './ranged-increment-penalty-global-bonus.mjs';
import { RequireMeleeThreatenGlobalBonus } from './require-melee-threatens.mjs';
import { ShootIntoMeleeGlobalBonus } from './shoot-into-melee-global-bonus.mjs';

export const registerGlobalBonuses = () => [
    DamageMultiplierGlobalBonus,
    FlankingGlobalBonus,
    HigherGroundGlobalBonus,
    RangedIncrementPenaltyGlobalBonus,
    RequireMeleeThreatenGlobalBonus,
    ShootIntoMeleeGlobalBonus,
].forEach(GlobalBonuses.registerBonus);
