import { MODULE_NAME } from '../../consts.mjs';
import { uniqueArray } from '../../util/unique-array.mjs';

export const armorFocusKey = 'armor-focus';
export const improvedArmorFocusKey = 'armor-focus-improved';

/**
 * @param { ActorPF } actor
 * @returns {string[]}
 */
export const getFocusedArmor = (actor) =>
    uniqueArray(actor[MODULE_NAME][armorFocusKey]?.
        filter(x => x.hasItemBooleanFlag(armorFocusKey))
        .flatMap(x => x.getFlag(MODULE_NAME, armorFocusKey))
        ?? []
    );

/**
 * @param { ActorPF } actor
 * @returns {string[]}
 */
export const getImprovedFocusedArmor = (actor) =>
    uniqueArray(actor[MODULE_NAME][improvedArmorFocusKey]?.
        filter(x => x.hasItemBooleanFlag(improvedArmorFocusKey))
        .flatMap(x => x.getFlag(MODULE_NAME, improvedArmorFocusKey))
        ?? []
    );
