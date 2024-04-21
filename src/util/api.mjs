
class Api {
    get allBonusTypes() { return Object.values(this.bonusTypeMap); }
    get allTargetTypes() { return Object.values(this.targetTypeMap); }
    bonusTypeMap = {};
    sources = {};
    targetTypeMap = {};
    migrate = {
        migrate: async () => { },
        v1: {
            migrateAmmoForActor: async () => { },
        },
    };

    applications = {};
    config = {
        versatileTraining: {},
    }

    inputs = {};

    SpecificBonuses = () => { };

    utils = {
        array: {},
    };
}

const _api = new Api();
const api = /** @type {RollBonusesAPI} */ (/** @type {unknown} */ (_api))
export { api };
