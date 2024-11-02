import { api } from './api.mjs';

/**
 * @template T
 * @param {T | T[]} a
 * @param {T | T[]} b
 * @returns {boolean} True if both arrays share a common element
 */
export const intersects = (a, b) => {
    const setA = new Set(Array.isArray(a) ? a : [a]);
    const setB = new Set(Array.isArray(b) ? b : [b]);
    const overlap = [...setA].find(x => setB.has(x));
    return !!overlap;
}

/**
 * @template T
 * @param {T[]} a
 * @param {T[]} b
 * @returns {T[]} Intersection of both arrays
 */
export const intersection = (a, b) => {
    const setA = new Set(a);
    const setB = new Set(b);
    const overlap = [...setA].filter(x => setB.has(x));
    return overlap;
}

/**
 * @template T
 * @param {T[]|Set<T>} a
 * @param {T|T[]|Set<T>} b
 * @returns {T[]} items in collection a that aren't in collection b
 */
export const difference = (a, b) => {
    const setA = Array.isArray(a) ? new Set(a) : a;
    const setB = Array.isArray(b) ? new Set(b) : b instanceof Set ? b : new Set([b]);
    const diff = [...setA].filter(x => !setB.has(x));
    return diff;
}

api.utils.array.difference = difference;
api.utils.array.intersects = intersects;
api.utils.array.intersection = intersection;
