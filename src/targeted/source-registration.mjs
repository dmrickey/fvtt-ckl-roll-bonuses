import { api } from '../util/api.mjs';

export class Sources {

    /**
     * Registers a targeted bonus/target source into the API
     *
     * @param {RollBonusesAPI['sources']['BaseSource']} source
     */
    static registerSource(source) {
        if (source.prototype instanceof api.sources.BaseBonus) {
            const bonus = /** @type {RollBonusesAPI['sources']['BaseBonus']} */ (/** @type {unknown} */ (source));
            api.bonusTypeMap[bonus.key] = bonus;
        }
        else if (source.prototype instanceof api.sources.BaseTarget) {
            const target = /** @type {RollBonusesAPI['sources']['BaseTarget']} */ (/** @type {unknown} */ (source));
            api.targetTypeMap[target.key] = target;
        }
        else if (source.prototype instanceof api.sources.BaseTargetOverride) {
            const targetOverride = /** @type {RollBonusesAPI['sources']['BaseTargetOverride']} */ (/** @type {unknown} */ (source));
            api.targetOverrideTypeMap[targetOverride.key] = targetOverride;
        }
    }

    static {
        api.utils.registerSource = Sources.registerSource;
    }
}
