import { MODULE_NAME } from '../consts.mjs'
import { api } from './api.mjs';
import { Trait } from './trait-builder.mjs';
import { truthiness } from './truthiness.mjs';
import { uniqueArray } from './unique-array.mjs';

/**
 * @param {ItemPF} item
 * @param {string} flag
 * @param {Record<string, string>} choices
 * @returns {Trait}
 */
export const getTraitsFromItem = (item, flag, choices) => new Trait(choices, item.getFlag(MODULE_NAME, flag) || []);

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
    var ids = uniqueArray(items.flatMap((i) => getIdsFromItem(i, flag)))
        .filter(truthiness);
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

api.utils.getIds = {
    getTraitsFromItem,
    getIdsFromItem,
    getIdsFromActor,
    getIdsBySourceFromActor,
}
