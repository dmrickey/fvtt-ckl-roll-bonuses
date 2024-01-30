

/** @type {{[key: string]: PrepareTargetData}} */
const targets = {};
/** @type {{[key: string]: PrepareBonusData}} */
const bonuses = {};

/**
 * @param {PrepareTargetData} target
 */
const registerTargetHbs = (target) => targets[target.key] = target;

/**
 * @param {PrepareBonusData} bonus
 */
const registerBonusHbs = (bonus) => bonuses[bonus.key] = bonus;

/**
 *
 * @param {ActorPF | null} actor
 * @param {ItemPF} item
 * @param {SetTargetBonus[]} sets
 * @returns {PreparedSetTargetBonus[]}
 */
const prepareHbsData = (actor, item, sets) => sets.map((setTargetBonus) => ({
    bonuses: setTargetBonus.bonuses.map((bonus) => bonuses[bonus.key]?.prepareBonusData(actor, item)),
    targets: setTargetBonus.targets.map((target) => targets[target.key]?.prepareTargetData(actor, item)),
}));

export {
    prepareHbsData,
    registerBonusHbs,
    registerTargetHbs,
};
