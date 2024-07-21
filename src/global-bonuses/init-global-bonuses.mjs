import { GlobalBonuses } from './all-global-bonuses.mjs';
import { RangedIncrementPenaltyGlobalBonus } from './ranged-increment-penalty.mjs';

export const registerGlobalBonuses = () => [
    RangedIncrementPenaltyGlobalBonus,
].forEach(GlobalBonuses.registerBonus);
