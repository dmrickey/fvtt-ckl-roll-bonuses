/**
 * @param {any[]} a
 * @param {any[]} b
 * @returns {boolean} True if both arrays share a common element
 */
export const intersects = (a, b) => {
    const setA = new Set(a);
    const setB = new Set(b);
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
