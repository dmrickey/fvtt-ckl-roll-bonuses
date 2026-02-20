import { SpecificBonus } from '../bonuses/_specific-bonus.mjs';
import { MODULE_NAME } from '../consts.mjs';
import { BaseSource } from '../targeted/_base-source.mjs';
import { api } from './api.mjs';
import { truthiness } from './truthiness.mjs';

/**
 * @overload
 * @param {ItemPF} source
 * @param {typeof BaseSource | typeof SpecificBonus} bonus
 * @returns {any}
 */

/**
 * @overload
 * @param {ItemPF} source
 * @param {string} key
 * @returns {any}
 */

/**
 * @param {ItemPF} source
 * @param {typeof BaseSource | typeof SpecificBonus | string} bonus
 * @returns {any}
 */
export const getSourceFlag = (source, bonus) => source.getFlag(MODULE_NAME, typeof bonus === 'string' ? bonus : bonus.key);

/**
 * @param {ActorPF} actor
 * @param {typeof BaseSource | typeof SpecificBonus | string} bonus
 * @returns {any[]}
 */
export const getSourceFlags = (actor, bonus) => {
    const key = typeof bonus === 'string' ? bonus : bonus.key
    const sources = actor.itemFlags?.boolean[key]?.sources || [];
    return sources.flatMap((source) => source.getFlag(MODULE_NAME, key)).filter(truthiness);
}

api.utils.getSourceFlag = getSourceFlag;
api.utils.getSourceFlags = getSourceFlags;
