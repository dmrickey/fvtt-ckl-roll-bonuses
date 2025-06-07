import { api } from './api.mjs'
import { uniqueArray } from './unique-array.mjs';

/**
 * @param {Nullable<ActorPF>} actor
 * @param {boolean} [includeSystem]
 * @returns {WeaponGroup[]}
 */
export const getWeaponGroupsFromActor = (actor, includeSystem = true) => {
    if (!actor) {
        return /** @type {WeaponGroup[]} */ (Object.keys(pf1.config.weaponGroups));
    }

    const groups = uniqueArray([
        ...[...actor.items].flatMap((item) => [...(item.system.weaponGroups?.total ?? [])]),
        ...(includeSystem ? Object.keys(pf1.config.weaponGroups) : []),
    ]);
    groups.sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()));
    return /** @type {WeaponGroup[]} */ (groups);
}

/**
 * @param {Nullable<ActorPF>} actor
 * @returns {Record<string, string>}
 */
export const getWeaponGroupChoicesFromActor = (actor) => {
    const groups = getWeaponGroupsFromActor(actor);
    const choices = groups.reduce((acc, curr) => ({ ...acc, [curr]: pf1.config.weaponGroups[curr] || curr, }), {});
    return choices;
}

api.utils.getWeaponGroupsFromActor = getWeaponGroupsFromActor;
