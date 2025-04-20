import { MODULE_NAME } from '../consts.mjs'
import { uniqueArray } from './unique-array.mjs';

/**
 * @template T
 * @param {ItemPF} item
 * @param {string} flag
 * @returns {T[]}
 */
export const getIdsFromItem = (item, flag) => item.getFlag(MODULE_NAME, flag) || [];

/**
 * @template T
 * @param {ActorPF} actor
 * @param {string} flag
 * @returns {T[]}
 */
export const getIdsFromActor = (actor, flag) => {
    const items = actor.itemFlags?.boolean[flag]?.sources ?? [];
    var ids = uniqueArray(items.flatMap((i) => getIdsFromItem(i, flag)));
    return ids;
}

/**
 * @template T
 * @param {ActorPF} actor
 * @param {string} flag
 * @returns {{ source: ItemPF, ids: T[]}[]}
 */
export const getIdsBySourceFromActor = (actor, flag) => {
    const items = actor.itemFlags?.boolean[flag]?.sources ?? [];
    return items.map((item) => ({
        source: item,
        ids: getIdsFromItem(item, flag),
    }));
}
