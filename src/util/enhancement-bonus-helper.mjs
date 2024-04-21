import { MODULE_NAME } from '../consts.mjs';

const key = 'enhancement';

/**
 * @param {ItemPF} item
 * @returns {{ baseEnh: number, stackingEnh: number }} increases
 */
const getCurrentEnhancementIncreases = (item) => {
    const { baseEnh, stackingEnh } = item[MODULE_NAME]?.[key] ?? {};
    return { baseEnh: baseEnh || 0, stackingEnh: stackingEnh || 0 };
}

/**
 * @param {ItemPF} item
 * @param {{ baseEnh: number, stackingEnh: number }} increases
 */
const setCurrentEnhancementIncreases = (item, { baseEnh, stackingEnh }) => {
    item[MODULE_NAME][key] = { baseEnh, stackingEnh };
}

export {
    getCurrentEnhancementIncreases,
    setCurrentEnhancementIncreases,
};
