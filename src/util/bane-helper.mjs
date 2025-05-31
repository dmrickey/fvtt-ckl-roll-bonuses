import { intersection } from './array-intersects.mjs';
import { currentTargets } from './get-current-targets.mjs';
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
    const targets = currentTargets();
    if (!targets.length) {
        return;
    }

    /** @type {CreatureType[]} */
    const creatureTypes = getIdsFromItem(source, creatureTypeKey);
    /** @type {CreatureSubtype[]} */
    const creatureSubtypes = getIdsFromItem(source, creatureSubtypeKey);
    if (!creatureTypes.length && !creatureSubtypes.length) {
        return;
    }

    const targetTypeMap = targets
        .map(target => target.actor?.race?.system.creatureTypes.base)
        .filter(truthiness);
    const targetTypes = targetTypeMap.reduce((acc, curr) => intersection(acc, curr), targetTypeMap[0]);
    const type = intersection(targetTypes, creatureTypes)[0];
    const typeLabel = type && pf1.config.creatureTypes[type] || type;

    const targetSubtypesMap = targets
        .map(target => target.actor?.race?.system.creatureSubtypes.base)
        .filter(truthiness);
    const targetSubtypes = targetSubtypesMap.reduce((acc, curr) => intersection(acc, curr), targetSubtypesMap[0]);
    const subtype = intersection(targetSubtypes, creatureSubtypes)[0];
    const subtypeLabel = subtype && pf1.config.creatureSubtypes[subtype] || subtype;

    if (creatureTypes.length && creatureSubtypes.length) {
        if (type && subtype) {
            return localize('bane-type-subtype', { type: typeLabel, subtype: subtypeLabel });
        }
    }
    else if (creatureTypes.length) {
        if (type) {
            return localize('bane-type', { type: typeLabel });
        }
    }
    else if (creatureSubtypes.length) {
        if (subtype) {
            return localize('bane-type', { type: subtypeLabel });
        }
    }
}