
class Api {
    get allBonusTypes() { return Object.values(this.bonusTypeMap); }
    get allBonusTypesKeys() { return Object.keys(this.bonusTypeMap); }
    get allTargetTypes() { return Object.values(this.targetTypeMap); }
    get allTargetTypesKeys() { return Object.keys(this.targetTypeMap); }
    get allTargetOverrideTypes() { return Object.values(this.targetOverrideTypeMap); }
    get allTargetOverrideTypesKeys() { return Object.keys(this.targetOverrideTypeMap); }
    get allGlobalTypes() { return Object.values(this.globalTypeMap); }
    get allGlobalTypesKeys() { return Object.keys(this.globalTypeMap); }
    bonusTypeMap = {};
    globalTypeMap = {};
    sources = {};
    targetTypeMap = {};
    targetOverrideTypeMap = {};

    applications = {};
    showApplication = {};
    config = {
        elementalFocus: {},
        versatilePerformance: {},
        versatileTraining: {},
    }

    inputs = {};

    SpecificBonuses = () => { };

    utils = {
        array: {},
        getIds: {},
        actionTypeHelpers: {},
    };
}

const _api = new Api();
const api = /** @type {RollBonusesAPI} */ (/** @type {unknown} */ (_api))
export { api };
