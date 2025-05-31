import { api } from './api.mjs';

/**
 * @template T
 * @param {ArrayOrSelf<T>} obj
 * @returns {T[]}
 */
export const toArray = (obj) => obj
    ? (Array.isArray(obj) ? obj : [obj])
    : [];

api.utils.toArray = toArray;
