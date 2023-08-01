
const regex = /([A-Za-z ])+/g;

/**
 * @param {ItemSpellPF} item
 * @returns {string[]}
 */
export function getSpellTypes(item) {
    return [...(item?.system?.types || '').matchAll(regex)]
        .flatMap(([a]) => a.split('or'))
        .map((a) => a.trim().toLowerCase());
}
