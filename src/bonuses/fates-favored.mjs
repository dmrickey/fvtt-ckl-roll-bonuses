import { hasAnyBFlag } from '../util/flag-helpers.mjs';
import { HookWrapperHandler, localHooks } from '../util/hooks.mjs';
import { localize } from '../util/localize.mjs';

const fatesFavored = 'fates-favored';

/**
 * @param {number | string} value
 * @param {ItemChange} itemChange
 * @returns {number | string}
 */
function patchChangeValue(value, itemChange) {
    const actor = itemChange.parent?.actor;
    value = itemChange.modifier === 'luck' && hasAnyBFlag(actor, fatesFavored)
        ? isNaN(+value) ? `${value} + 1` : (+value + 1)
        : value;
    return value;
}
HookWrapperHandler.registerHandler(localHooks.patchChangeValue, patchChangeValue);

/**
 * Increase luck source modifier by 1 for tooltip
 * @param {ItemPF} item
 * @param {ModifierSource[]} sources
 * @returns {ModifierSource[]}
 */
function getAttackSources(item, sources) {
    if (!item.hasItemBooleanFlag(fatesFavored)) return sources;

    let /** @type {ModifierSource?} */ fatesFavoredSource = null;
    sources.forEach((source) => {
        if (source.modifier === 'luck') {
            const value = source.value;
            if (isNaN(+value) && `${value}`.endsWith(' + 1')) {
                source.value = `${source.value}`.slice(0, -4);
            }
            else if (!isNaN(+value)) {
                source.value = +value - 1;
            }

            fatesFavoredSource = { name: localize(fatesFavored), modifier: 'luck', sort: source.sort + 1, value: 1 };
        }
    });

    if (fatesFavoredSource) {
        sources.push(fatesFavoredSource);
        return sources.sort((a, b) => b.sort - a.sort);
    }

    return sources;
}
Hooks.on(localHooks.itemGetAttackSources, getAttackSources);
