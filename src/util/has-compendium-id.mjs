import { api } from './api.mjs';

/**
 * @param {ItemPF} item
 * @param {string} id
 * @returns {boolean}
 */
export const itemHasCompendiumId = (item, id) => !!item?._stats.compendiumSource?.includes(id)
    || !!item?.flags.core?.sourceId?.includes(id);

api.utils.itemHasCompendiumId = itemHasCompendiumId;
