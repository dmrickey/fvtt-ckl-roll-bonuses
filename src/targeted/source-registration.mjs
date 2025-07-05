import { api } from '../util/api.mjs';

export class Sources {

    /**
     * Registers a targeted bonus/target source into the API
     *
     * @param {RollBonusesAPI['sources']['BaseSource']} source
     */
    static registerSource(source) {
        if (source.prototype instanceof api.sources.BaseBonus) {
            const bonus = /** @type {RollBonusesAPI['sources']['BaseBonus']} */ (source);
            const key = /** @type {keyof RollBonusesAPI['bonusTypeMap']} */ (bonus.key);
            if (!!api.bonusTypeMap[key]) {
                console.error(`Roll Bonus for key '${key}' (${source.label}) has already been registered. This is not a user error. Report this to the mod author adding this bonus.`);
                return;
            }
            // @ts-ignore
            api.bonusTypeMap[key] = bonus;
        }
        else if (source.prototype instanceof api.sources.BaseTarget) {
            const target = /** @type {RollBonusesAPI['sources']['BaseTarget']} */ (source);
            const key = /** @type {keyof RollBonusesAPI['targetTypeMap']} */ (target.key);
            if (!!api.targetTypeMap[key]) {
                console.error(`Roll Bonus for key '${key}' (${source.label}) has already been registered. This is not a user error. Report this to the mod author adding this bonus.`);
                return;
            }
            // @ts-ignore
            api.targetTypeMap[key] = target;

            if (target.isConditionalTarget) {
                // @ts-ignore
                api.conditionalTargetTypeMap[key] = target;
            }
        }
        else if (source.prototype instanceof api.sources.BaseTargetOverride) {
            const targetOverride = /** @type {RollBonusesAPI['sources']['BaseTargetOverride']} */ (source);
            const key = /** @type {keyof RollBonusesAPI['targetOverrideTypeMap']} */ (targetOverride.key);
            if (!!api.targetOverrideTypeMap[key]) {
                console.error(`Roll Bonus for key '${key}' (${source.label}) has already been registered. This is not a user error. Report this to the mod author adding this bonus.`);
                return;
            }
            // @ts-ignore
            api.targetOverrideTypeMap[key] = targetOverride;
        }
    }

    static {
        api.utils.registerSource = Sources.registerSource;
    }
}
