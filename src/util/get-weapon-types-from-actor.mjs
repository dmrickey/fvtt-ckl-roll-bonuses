import { api } from './api.mjs'
import { getActorItemsByTypes } from './get-actor-items-by-type.mjs';
import { truthiness } from './truthiness.mjs';
import { uniqueArray } from './unique-array.mjs'

/**
 * @param {Nullable<ActorPF>} actor
 * @returns {string[]}
 */
export const getWeaponTypesFromActor = (actor) => {
    if (!actor) {
        return [];
    }

    const types = uniqueArray(
        [
            ...getActorItemsByTypes(actor, 'weapon', 'attack'),
            ...(actor.itemFlags?.boolean[api.targetOverrideTypeMap['target-override_weapon-type-override'].key]?.sources ?? []),
        ].flatMap(x => x.system.baseTypes)
    ).filter(truthiness);
    types.sort();
    return types;
}

api.utils.getWeaponTypesFromActor = getWeaponTypesFromActor;
