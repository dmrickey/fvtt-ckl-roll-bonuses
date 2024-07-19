import { GlobalBonuses } from './all-global-bonuses.mjs';
import { RangedIncrementPenalty } from './ranged-attack-penalty.mjs';

export const registerGlobalBonuses = () => [
    RangedIncrementPenalty,
].forEach(GlobalBonuses.registerBonus);
