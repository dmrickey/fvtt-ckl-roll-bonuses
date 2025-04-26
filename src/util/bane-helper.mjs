import { intersection } from './array-intersects.mjs';
import { getIdsFromItem } from './get-id-array-from-flag.mjs';
import { localize } from './localize.mjs';
import { truthiness } from './truthiness.mjs';

/**
 * @param {ItemPF} source
 * @param {string} creatureTypeKey
 * @param {string} creatureSubtypeKey
 * @returns {string | undefined}
 */
export const getBaneLabelForTargetsFromSource = (source, creatureTypeKey, creatureSubtypeKey) => {
    const targets = [...game.user.targets];
    if (!targets.length) {
        return;
    }

    /** @type {string[]} */
    const creatureTypes = getIdsFromItem(source, creatureTypeKey);
    /** @type {string[]} */
    const creatureSubtypes = getIdsFromItem(source, creatureSubtypeKey);
    if (!creatureTypes.length && !creatureSubtypes.length) {
        return;
    }

    const targetTypeMap = targets
        .map(target => target.actor?.race?.system.creatureTypes.base)
        .filter(truthiness);
    const targetTypes = targetTypeMap.reduce((acc, curr) => intersection(acc, curr), targetTypeMap[0]);
    let type = intersection(targetTypes, creatureTypes)[0];
    type = pf1.config.creatureTypes[type] || type;

    const targetSubtypesMap = targets
        .map(target => target.actor?.race?.system.creatureSubtypes.base)
        .filter(truthiness);
    const targetSubtypes = targetSubtypesMap.reduce((acc, curr) => intersection(acc, curr), targetSubtypesMap[0]);
    let subtype = intersection(targetSubtypes, creatureSubtypes)[0];
    subtype = pf1.config.creatureSubtypes[subtype] || subtype;

    if (creatureTypes.length && creatureSubtypes.length) {
        if (type && subtype) {
            return localize('bane-type-subtype', { type, subtype });
        }
    }
    else if (creatureTypes.length) {
        if (type) {
            return localize('bane-type', { type });
        }
    }
    else if (creatureSubtypes.length) {
        if (subtype) {
            return localize('bane-type', { type: subtype });
        }
    }
}