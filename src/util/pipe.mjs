import { api } from './api.mjs';

/**
 * @template A
 * @overload
 * @param {A} value
 * @returns {A}
 */

/**
 * @template A, B
 * @overload
 * @param {A} value
 * @param {(_: A) => B} fn
 * @returns {B}
 */

/**
 * @template A, B, C
 * @overload
 * @param {A} value
 * @param {(_: A) => B} fn1
 * @param {(_: B) => C} fn2
 * @returns {C}
 */

/**
 * @template A, B, C, D
 * @overload
 * @param {A} value
 * @param {(_: A) => B} fn1
 * @param {(_: B) => C} fn2
 * @param {(_: C) => D} fn3
 * @returns {D}
 */

/**
 * @template A, B, C, D, E
 * @overload
 * @param {A} value
 * @param {(_: A) => B} fn1
 * @param {(_: B) => C} fn2
 * @param {(_: C) => D} fn3
 * @param {(_: D) => E} fn4
 * @returns {E}
 */

/**
 * @template A, B, C, D, E, F
 * @overload
 * @param {A} value
 * @param {(_: A) => B} fn1
 * @param {(_: B) => C} fn2
 * @param {(_: C) => D} fn3
 * @param {(_: D) => E} fn4
 * @param {(_: E) => F} fn5
 * @returns {F}
 */

/**
 * @template A, B, C, D, E, F, G
 * @overload
 * @param {A} value
 * @param {(_: A) => B} fn1
 * @param {(_: B) => C} fn2
 * @param {(_: C) => D} fn3
 * @param {(_: D) => E} fn4
 * @param {(_: E) => F} fn5
 * @param {(_: F) => G} fn6
 * @returns {G}
 */

/**
 * @template A, B, C, D, E, F, G, H
 * @overload
 * @param {A} value
 * @param {(_: A) => B} fn1
 * @param {(_: B) => C} fn2
 * @param {(_: C) => D} fn3
 * @param {(_: D) => E} fn4
 * @param {(_: E) => F} fn5
 * @param {(_: F) => G} fn6
 * @param {(_: G) => H} fn7
 * @returns {H}
 */

/**
 * @template A, B, C, D, E, F, G, H, I
 * @overload
 * @param {A} value
 * @param {(_: A) => B} fn1
 * @param {(_: B) => C} fn2
 * @param {(_: C) => D} fn3
 * @param {(_: D) => E} fn4
 * @param {(_: E) => F} fn5
 * @param {(_: F) => G} fn6
 * @param {(_: G) => H} fn7
 * @param {(_: H) => I} fn8
 * @returns {I}
 */

/**
 * @param {any} value
 * @param {...Function} fns
 * @returns {unknown}
 */
export const pipe = (value, ...fns) => {
    /** @param {any} x */
    fns[0] ||= (x) => x;
    return fns.reduce((acc, fn) => fn(acc), value);
}

api.utils.pipe = pipe;
