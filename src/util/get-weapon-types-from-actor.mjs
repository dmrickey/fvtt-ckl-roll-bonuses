import { api } from './api.mjs';
import { getActorItemsByTypes } from './get-actor-items-by-type.mjs';
import { isEquipped } from './is-equipped.mjs';
import { truthiness } from './truthiness.mjs';
import { uniqueArray } from './unique-array.mjs';

/**
 * @param {Nullable<ActorPF>} actor
 * @param {Object} [options]
 * @param {boolean} [options.onlyEquipped=false]
 * @returns {string[]}
 */
export const getWeaponTypesFromActor = (actor, { onlyEquipped = false } = {}) => {
    if (!actor) {
        return [];
    }

    const types = uniqueArray(
        (/** @type {(ItemWeaponPF | ItemAttackPF)[]} */(
            [
                ...getActorItemsByTypes(actor, 'weapon', 'attack'),
                ...(actor.itemFlags?.boolean[api.targetOverrideTypeMap['target-override_weapon-type-override'].key]?.sources ?? []),
            ]
        ))
            .filter((item) => !onlyEquipped || isEquipped(item))
            .flatMap(x => x.system.baseTypes)
    ).filter(truthiness);
    types.sort();
    return types;
}

api.utils.getWeaponTypesFromActor = getWeaponTypesFromActor;
