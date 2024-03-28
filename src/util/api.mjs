
class Api {
    get allBonusTypes() { return Object.values(this.bonusTypeMap); }
    get allTargetTypes() { return Object.values(this.targetTypeMap); }
    bonusTypeMap = {};
    sources = {};
    targetTypeMap = {};
}

const _api = new Api();
const api = /** @type {RollBonusesAPI} */ (/** @type {unknown} */ (_api))
export { api };
