import { api } from './api.mjs'
import { uniqueArray } from './unique-array.mjs'

/**
 * @param {Nullable<ActorPF>} actor
 * @returns {string[]}
 */
export const getWeaponTypesFromActor = (actor) => {
    if (!actor) {
        return [];
    }

    const types = uniqueArray([...actor.items].flatMap((item) => item.system.baseTypes ?? []));
    types.sort();
    return types;
}

api.utils.getWeaponTypesFromActor = getWeaponTypesFromActor;
