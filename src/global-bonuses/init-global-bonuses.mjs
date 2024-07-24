import { GlobalBonuses } from './all-global-bonuses.mjs';
import { RequireMeleeThreatenGlobalBonus } from './require-melee-threatens.mjs';
import { HigherGroundGlobalBonus } from './higher-ground-global-bonus.mjs';
import { RangedIncrementPenaltyGlobalBonus } from './ranged-increment-penalty-global-bonus.mjs';
import { ShootIntoMeleeGlobalBonus } from './shoot-into-melee-global-bonus.mjs';

export const registerGlobalBonuses = () => [
    HigherGroundGlobalBonus,
    RangedIncrementPenaltyGlobalBonus,
    RequireMeleeThreatenGlobalBonus,
    ShootIntoMeleeGlobalBonus,
].forEach(GlobalBonuses.registerBonus);
