import { MODULE_NAME } from '../consts.mjs';
import { localHooks } from '../util/hooks.mjs';
import { localize } from '../util/localize.mjs';

const fatesFavored = 'fates-favored';

/**
 * @param {() => number} wrapped
 * @this ItemChange
 */
function patchChangeValue(wrapped) {
    const actor = this.parent?.actor;
    const value = wrapped();
    return this.modifier === 'luck' && actor?.itemFlags?.boolean?.[fatesFavored]
        ? isNaN(+value) ? `${value} + 1` : (+value + 1)
        : value;
}
Hooks.once('setup', () => libWrapper.register(MODULE_NAME, 'pf1.components.ItemChange.prototype.value', patchChangeValue, libWrapper.WRAPPER));

/**
 * Increase luck source modifier by 1 for tooltip
 * @param {ItemPF} item
 * @param {ModifierSource[]} sources
 * @returns {ModifierSource[]}
 */
function getAttackSources(item, sources) {
    if (!item?.actor?.itemFlags?.boolean?.[fatesFavored]) return sources;

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
