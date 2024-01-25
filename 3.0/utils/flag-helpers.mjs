import { SETS_FLAG_KEY, MODULE_NAME } from '../consts.mjs';

// might need to do a bit more complex than here -- see https://discord.com/channels/170995199584108546/722559135371231352/1199838674616057926
/**
 * @param {ItemPF} item
 * @returns {SetTargetBonus[]}
 */
const _getSets = (item) => {
    const flags = item.getFlag(MODULE_NAME, SETS_FLAG_KEY) || [];
    return [...flags];
}

/**
 * @template {'bonuses'|'targets'} BonusOrTarget
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {BonusOrTarget} type
 * @param {number} index
 * @returns {SetTargetBonus[BonusOrTarget][number]}
 */
const _getSetTargetBonusByIndex = (item, setIndex, type, index) => {
    const sets = _getSets(item);
    const current = (sets[setIndex]?.[type] || [])[index];
    return current;
}

/**
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {number} index
 * @returns {Bonus}
 */
const getSetBonusByIndex = (item, setIndex, index) => _getSetTargetBonusByIndex(item, setIndex, 'bonuses', index);

/**
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {number} index
 * @returns {Target}
 */
const getSetTargetByIndex = (item, setIndex, index) => _getSetTargetBonusByIndex(item, setIndex, 'targets', index);

/**
 *
 * @template {'bonuses'|'targets'} BonusOrTarget
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {BonusOrTarget} type
 * @param {string} key
 * @returns {SetTargetBonus[BonusOrTarget][number][]}
 */
const _getSetTargetBonusByKey = (item, setIndex, type, key) => {
    const sets = _getSets(item);
    const current = sets[setIndex]?.[type] || [];
    const value = current
        .filter((x) => x.key === key);
    return value;
}

/**
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {string} key
 * @returns {Bonus[]}
 */
const getSetBonusByKey = (item, setIndex, key) => _getSetTargetBonusByKey(item, setIndex, 'bonuses', key);

/**
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {string} key
 * @returns {Target[]}
 */
const getSetTargetByKey = (item, setIndex, key) => _getSetTargetBonusByKey(item, setIndex, 'targets', key);

/**
 * @param {ItemPF} item
 * @param {number} setIndex
 * @returns {SetTargetBonus}
 */
const getSetByIndex = (item, setIndex) => _getSets(item)[setIndex];

/**
 *
 * @param {ItemPF} item
 * @returns {SetTargetBonus[]}
 */
const getSets = (item) => _getSets(item);

/**
 * @template {'bonuses'|'targets'} BonusOrTarget
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {BonusOrTarget} type
 * @param {SetTargetBonus[BonusOrTarget][number]} value
 */
const _addSetTargetBonus = async (item, setIndex, type, value) => {
    const sets = _getSets(item);
    const set = sets[setIndex] || { bonuses: [], targets: [] };
    // @ts-ignore
    set[type].push(value);
    sets[setIndex] = set;
    await item.setFlag(MODULE_NAME, SETS_FLAG_KEY, sets);
}

/**
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {Bonus} bonus
 */
const addSetBonus = async (item, setIndex, bonus) => await _addSetTargetBonus(item, setIndex, 'bonuses', bonus);

/**
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {Target} target
 */
const addSetTarget = async (item, setIndex, target) => await _addSetTargetBonus(item, setIndex, 'targets', target);

/**
 * @template {'bonuses'|'targets'} BonusOrTarget
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {BonusOrTarget} type
 * @param {SetTargetBonus[BonusOrTarget][number]} value
 * @param {number} index
 */
const _updateSetTargetBonus = async (item, setIndex, type, value, index) => {
    const sets = _getSets(item);
    const set = sets[setIndex] || { bonuses: [], targets: [] };
    if (set[type][index] && set[type][index].key !== value.key) {
        throw new Error('this should never happen');
        // todo see if I need to handle this (or if I do get this, it's probably broken code elsewhere)
    }
    set[type][index] = value;
    sets[setIndex] = set;
    await item.setFlag(MODULE_NAME, SETS_FLAG_KEY, sets);
}

/**
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {Bonus} bonus
 * @param {number} index
 */
const updateSetBonus = async (item, setIndex, bonus, index) => await _updateSetTargetBonus(item, setIndex, 'bonuses', bonus, index);

/**
 * @param {ItemPF} item
 * @param {number} setIndex
 * @param {Target} target
 * @param {number} index
 */
const updateSetTarget = async (item, setIndex, target, index) => await _updateSetTargetBonus(item, setIndex, 'targets', target, index);

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
