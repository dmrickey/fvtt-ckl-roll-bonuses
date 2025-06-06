import { api } from './api.mjs';

/**
 * Returns true if object is truthy. Useful for filtering arrays and being obvious about what's happening.
 * @template T
 * @param {T | false | 0 | "" | null | undefined} x
 * @returns {x is T} True if object is truthy
 */
export const truthiness = x =>
    typeof x === 'string'
        ? !!x?.trim()
        : !!x;

api.utils.truthiness = truthiness;
