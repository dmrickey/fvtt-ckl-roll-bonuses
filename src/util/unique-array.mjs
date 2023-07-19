/**
 * Reduces array of simple types to unique values
 * @template T
 * @param {T[] | undefined} x
 * @returns {T[]} Array of distinct values from array
 */
export const uniqueArray = x => x ? [...new Set(x)] : [];
