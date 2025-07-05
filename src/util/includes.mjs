import { api } from './api.mjs';

/**
 * @template {string} S
 * @param {Readonly<Array<S>>} haystack
 * @param {string} needle
 * @returns {needle is S}
 */
export const includes = (haystack, needle) => {
    const _haystack = /** @type {readonly Array<S>} */ /** @type {any} */ (haystack);
    return _haystack.includes(needle)
}

api.utils.array.includes = includes;
