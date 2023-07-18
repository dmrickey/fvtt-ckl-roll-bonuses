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
