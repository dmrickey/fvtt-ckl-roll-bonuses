import { api } from '../util/api.mjs';
import { BaseSource } from './_base-source.mjs';
import { BaseBonus } from './bonuses/_base-bonus.mjs';
import { registerBonuses } from './bonuses/_init-bonuses.mjs';
import { BaseTargetOverride } from './target-overides/_base-target-override.mjs';
import { registerTargetOverrides } from './target-overides/_init-target-overrides.mjs';
import { BaseTarget } from './targets/_base-target.mjs';
import { registerTargets } from './targets/_init-targets.mjs';
import { BaseConditionalTarget } from './targets/conditional/_base-conditional.target.mjs';

export const initSources = () => {
    api.sources.BaseBonus = BaseBonus;
    api.sources.BaseSource = BaseSource;
    api.sources.BaseTarget = BaseTarget;
    api.sources.BaseConditionalTarget = BaseConditionalTarget;
    api.sources.BaseTargetOverride = BaseTargetOverride;

    registerBonuses();
    registerTargets();
    registerTargetOverrides();

    api.allBonusTypes.forEach((bonus) => bonus.init());
    api.allTargetTypes.forEach((target) => target.init());
    api.allTargetOverrideTypes.forEach((targetOverride) => targetOverride.init());
};
