import { api } from '../util/api.mjs';
import { BaseSource } from './base-source.mjs';
import { BaseBonus } from './bonuses/base-bonus.mjs';
import { registerBonuses } from './bonuses/init-bonuses.mjs';
import { BaseTarget } from './targets/base-target.mjs';
import { registerTargets } from './targets/init-targets.mjs';

export const initSources = () => {
    api.sources.BaseBonus = BaseBonus;
    api.sources.BaseSource = BaseSource;
    api.sources.BaseTarget = BaseTarget;

    registerBonuses();
    registerTargets();

    api.allBonusTypes.forEach((bonus) => bonus.init());
    api.allTargetTypes.forEach((target) => target.init());
};
