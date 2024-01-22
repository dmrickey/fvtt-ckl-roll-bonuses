import { SETS_FLAG_KEY, MODULE_NAME } from '../consts.mjs';

/**
 *
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {'bonuses'|'targets'} type
 * @param {number} index
 * @returns {IndexedBonus|IndexedTarget}
 */
const _getSetTargetBonusByIndex = (item, setIndex, type, index) => {
    const sets = item.getFlag(MODULE_NAME, SETS_FLAG_KEY) || [];
    const current = (sets[setIndex]?.[type] || [])[index];
    return current
        ? { ...current, index }
        : current;
}

/**
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {number} index
 * @returns {IndexedBonus}
 */
const getSetBonusByIndex = (item, setIndex, index) => _getSetTargetBonusByIndex(item, setIndex, 'bonuses', index);

/**
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {number} index
 * @returns {IndexedTarget}
 */
// @ts-ignore
const getSetTargetByIndex = (item, setIndex, index) => _getSetTargetBonusByIndex(item, setIndex, 'targets', index);

/**
 *
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {'bonuses'|'targets'} type
 * @param {string} key
 * @returns {Array<IndexedBonus|IndexedTarget>}
 */
const _getSetTargetBonusByKey = (item, setIndex, type, key) => {
    const sets = item.getFlag(MODULE_NAME, SETS_FLAG_KEY) || [];
    const current = sets[setIndex]?.[type] || [];
    const value = current
        .map((x, i) => ({ ...x, index: i }))
        .filter((x) => x.key === key);
    return value;
}

/**
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {string} key
 * @returns {IndexedBonus[]}
 */
const getSetBonusByKey = (item, setIndex, key) => _getSetTargetBonusByKey(item, setIndex, 'bonuses', key);

/**
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {string} key
 * @returns {IndexedTarget[]}
 */
// @ts-ignore
const getSetTargetByKey = (item, setIndex, key) => _getSetTargetBonusByKey(item, setIndex, 'targets', key);

/**
 * @param {ItemPF} item
 * @param {number} setIndex
 */
const getSetByIndex = (item, setIndex) => {
    return (getSets(item))[setIndex];
}

/**
 * @param {ItemPF} item
 */
const getSets = (item) => {
    return item.getFlag(MODULE_NAME, SETS_FLAG_KEY);
}

/**
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {Bonus} bonus
 */
const addSetBonus = async (item, setIndex, bonus) => {
    const sets = item.getFlag(MODULE_NAME, SETS_FLAG_KEY) || [];
    const set = sets[setIndex] || { bonuses: [], targets: [] };
    set.bonuses.push(bonus)
    sets[setIndex] = set;
    await item.setFlag(MODULE_NAME, SETS_FLAG_KEY, sets);
};

/**
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {Target} target
 */
const addSetTarget = async (item, setIndex, target) => {
    const sets = item.getFlag(MODULE_NAME, SETS_FLAG_KEY) || [];
    const set = sets[setIndex] || { bonuses: [], targets: [] };
    set.targets.push(target)
    sets[setIndex] = set;
    await item.setFlag(MODULE_NAME, SETS_FLAG_KEY, sets);
}

/**
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {Bonus} bonus
 * @param {number} index
 */
const updateSetBonus = async (item, setIndex, bonus, index) => {
    const sets = item.getFlag(MODULE_NAME, SETS_FLAG_KEY) || [];
    const set = sets[setIndex] || { bonuses: [], targets: [] };
    if (set.bonuses[index] && set.bonuses[index].key !== bonus.key) {
        throw new Error('this should never happen');
        // todo see if I need to handle this (or if I do get this, it's probably broken code elsewhere)
    }
    set.bonuses[index] = bonus;
    sets[setIndex] = set;
    await item.setFlag(MODULE_NAME, SETS_FLAG_KEY, sets);
}

/**
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {Target} target
 * @param {number} index
 */
const updateSetTarget = async (item, setIndex, target, index) => {
    const sets = item.getFlag(MODULE_NAME, SETS_FLAG_KEY) || [];
    const set = sets[setIndex] || { bonuses: [], targets: [] };
    if (set.targets[index] && set.targets[index].key !== target.key) {
        throw new Error('this should never happen');
        // todo see if I need to handle this (or if I do get this, it's probably broken code elsewhere)
    }
    set.targets[index] = target;
    sets[setIndex] = set;
    await item.setFlag(MODULE_NAME, SETS_FLAG_KEY, sets);
}

/**
 *
 * @param {ItemPF} item
 */
const addSet = async (item) => {
    const current = getSets(item);
    current.push({ bonuses: [], targets: [] });
    await item.setFlag(MODULE_NAME, SETS_FLAG_KEY, current);
}

export {
    addSet,
    addSetBonus,
    addSetTarget,
    getSetBonusByIndex,
    getSetBonusByKey,
    getSetByIndex,
    getSets,
    getSetTargetByIndex,
    getSetTargetByKey,
    updateSetBonus,
    updateSetTarget,
};
