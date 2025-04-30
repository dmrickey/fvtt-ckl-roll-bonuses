import { api } from './api.mjs';

/**
 * @typedef {`+${number}` | `-${number}`} Signed
 */

/**
 * Turns a number into a signed string
 * @param {number} num
 * @returns {string}
 */
export const signed = (num) => `+${num}`.replace("+-", "-");

api.utils.signed = signed;
