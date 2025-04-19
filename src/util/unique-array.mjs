import { api } from './api.mjs';

/**
 * Reduces array of simple types to unique values
 * @template T
 * @param {T[] | undefined | null} x
 * @returns {T[]} Array of distinct values from array
 */
export const uniqueArray = x => [...new Set(x || [])];
export const distinct = uniqueArray;

api.utils.array.distinct = distinct;
api.utils.array.uniqueArray = uniqueArray;
