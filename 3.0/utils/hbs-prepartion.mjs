

/** @type {{[key: string]: PrepareTargetData}} */
const targets = {};
/** @type {{[key: string]: PrepareBonusData}} */
const bonuses = {};

/**
 * @param {string} key
 * @param {PrepareTargetData} target
 */
const registerTarget = (key, target) => targets[key] = target;

/**
 * @param {string} key
 * @param {PrepareBonusData} bonus
 */
const registerBonus = (key, bonus) => bonuses[key] = bonus;

/**
 *
 * @param {ActorPF | null} actor
 * @param {ItemPF} item
 * @param {SetTargetBonus[]} sets
 * @returns {PreparedSetTargetBonus[]}
 */
const prepareData = (actor, item, sets) => sets.map((setTargetBonus) => ({
    bonuses: setTargetBonus.bonuses.map((bonus) => bonuses[bonus.key]?.prepareBonusData(actor, item)),
    targets: setTargetBonus.targets.map((target) => targets[target.key]?.prepareTargetData(actor, item)),
}));

export {
    prepareData,
    registerBonus,
    registerTarget,
};
