/**
 * @param {{ prototype: any}} x
 * @param {RollBonusesAPI} a
 * @returns {x is RollBonusesAPI['sources']['BaseConditionalTarget']}
 */
const isConditionalTarget = (x, a) => x.prototype instanceof a['sources']['BaseConditionalTarget'];


class Api {
    sources = {};

    bonusTypeMap = {};
    get allBonusTypes() { return Object.values(this.bonusTypeMap); }
    get allBonusTypesKeys() { return Object.keys(this.bonusTypeMap); }

    targetTypeMap = {};
    get allTargetTypes() { return Object.values(this.targetTypeMap); }
    get allTargetTypesKeys() { return Object.keys(this.targetTypeMap); }

    get allConditionalTargetTypes() {
        return this.allTargetTypes
            .filter(x => isConditionalTarget(x, ( /** @type {RollBonusesAPI} *//** @type {any} */(this))));
    }

    targetOverrideTypeMap = {};
    get allTargetOverrideTypes() { return Object.values(this.targetOverrideTypeMap); }
    get allTargetOverrideTypesKeys() { return Object.keys(this.targetOverrideTypeMap); }

    globalTypeMap = {};
    get allGlobalTypes() { return Object.values(this.globalTypeMap); }
    get allGlobalTypesKeys() { return Object.keys(this.globalTypeMap); }

    specificBonusTypeMap = {};
    get allSpecificBonusTypes() { return Object.values(this.specificBonusTypeMap); }
    get allSpecificBonusTypesKeys() { return Object.keys(this.specificBonusTypeMap); }

    applications = {};
    showApplication = {};
    config = {
        elementalFocus: {},
        knowledgeSkills: [],
        rogueClasses: [],
        versatilePerformance: {},
        versatileTraining: {},
    }

    inputs = {};

    /** @deprecated use root level properties instead */
    SpecificBonuses = () => {
        foundry.utils.logCompatibilityWarning('api.SpecificBonuses is deprecated. Access specificBonusTypeMap, allSpecificBonusTypes, or allSpecificBonusTypesKeys off of api directly');

        return {
            allSpecificBonuses: this.specificBonusTypeMap,
            allSpecificBonusKeys: this.allSpecificBonusTypesKeys,

            registerSpecificBonus: () => console.error('todo'),
        }
    };

    utils = {
        array: {},
        getIds: {},
        actionTypeHelpers: {},
    };
}

const _api = new Api();
const api = /** @type {RollBonusesAPI} */ (/** @type {unknown} */ (_api));
export { api };
