import { api } from './api.mjs';

/**
 * @template T
 * @param {T | T[] | Set<T>} a
 * @returns {Set<T>}
 */
const toSet = (a) => a instanceof Set ? a : Array.isArray(a) ? new Set(a) : new Set([a])

/**
 * @template T
 * @param {Nullable<T | T[] | Set<T>>} a
 * @param {Nullable<T | T[] | Set<T>>} b
 * @returns {boolean} True if both arrays share at least one  common element
 */
export const intersects = (a, b) => {
    if (!a && !b) return true;
    if (!a || !b) return false;

    const setA = toSet(a);
    const setB = toSet(b);

    // @ts-expect-error implemented by foundry
    const intersects = setA.intersects(setB);
    return intersects;
}

/**
 * @template T
 * @param {T[]} a
 * @param {T[]} b
 * @returns {T[]} Intersection of both arrays
 */
export const intersection = (a, b) => {
    const setA = toSet(a);
    const setB = toSet(b);

    const intersection = /** @type {Set<T>} */ (/** @type {any} */ setA.intersection(setB));
    return [...intersection];
}

/**
 * @template T
 * @param {T|T[]|Set<T>} a
 * @param {T|T[]|Set<T>} b
 * @returns {T[]} items in collection a that aren't in collection b
 */
export const difference = (a, b) => {
    const setA = toSet(a);
    const setB = toSet(b);

    const diff = /** @type {Set<T>} */ (/** @type {any} */ setA.difference(setB));
    return [...diff];
}

api.utils.array.difference = difference;
api.utils.array.intersects = intersects;
api.utils.array.intersection = intersection;
