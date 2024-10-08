import { MODULE_NAME } from '../../consts.mjs';
import { getCachedBonuses } from '../../util/get-cached-bonuses.mjs';
import { uniqueArray } from '../../util/unique-array.mjs';

export const armorFocusKey = 'armor-focus';
export const improvedArmorFocusKey = 'armor-focus-improved';

/**
 * @param { ActorPF } actor
 * @returns {string[]}
 */
export const getFocusedArmor = (actor) =>
    uniqueArray(getCachedBonuses(actor, armorFocusKey)
        .filter(x => x.hasItemBooleanFlag(armorFocusKey))
        .flatMap(x => x.getFlag(MODULE_NAME, armorFocusKey))
    );

/**
 * @param { ActorPF } actor
 * @returns {string[]}
 */
export const getImprovedFocusedArmor = (actor) =>
    uniqueArray(getCachedBonuses(actor, improvedArmorFocusKey)
        .filter(x => x.hasItemBooleanFlag(improvedArmorFocusKey))
        .flatMap(x => x.getFlag(MODULE_NAME, improvedArmorFocusKey))
    );
