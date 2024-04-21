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
            api.bonusTypeMap[source.key] = bonus;
        }
        else if (source.prototype instanceof api.sources.BaseTarget) {
            const target = /** @type {RollBonusesAPI['sources']['BaseTarget']} */ (/** @type {unknown} */ (source));
            api.targetTypeMap[source.key] = target;
        }
    }

    static {
        api.utils.registerSource = Sources.registerSource;
    }
}
