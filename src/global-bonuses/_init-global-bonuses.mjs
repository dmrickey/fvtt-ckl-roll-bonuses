import { GlobalBonuses } from './all-global-bonuses.mjs';
import { RequireMeleeThreatenGlobalBonus } from './require-melee-threatens.mjs';
import { HigherGroundGlobalBonus } from './higher-ground-global-bonus.mjs';
import { RangedIncrementPenaltyGlobalBonus } from './ranged-increment-penalty-global-bonus.mjs';
import { ShootIntoMeleeGlobalBonus } from './shoot-into-melee-global-bonus.mjs';
import { FlankingGlobalBonus } from './flanking-global-bonus.mjs';

export const registerGlobalBonuses = () => [
    FlankingGlobalBonus,
    HigherGroundGlobalBonus,
    RangedIncrementPenaltyGlobalBonus,
    RequireMeleeThreatenGlobalBonus,
    ShootIntoMeleeGlobalBonus,
].forEach(GlobalBonuses.registerBonus);
