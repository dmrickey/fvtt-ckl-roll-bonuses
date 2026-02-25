import { api } from './api.mjs'
import { truthiness } from './truthiness.mjs';
import { uniqueArray } from './unique-array.mjs';

/**
 * @param {Nullable<ActorPF>} actor
 * @param {object} [options]
 * @param {boolean} [options.onlyEquipped] - if true, only return weapon groups for equipped items
 * @returns {WeaponGroup[]}
 */
export const getWeaponGroupsFromActor = (actor, { onlyEquipped = false } = {}) => {
    if (!actor) {
        return /** @type {WeaponGroup[]} */ (Object.keys(pf1.config.weaponGroups));
    }

    const equiped = [...actor.items]
        .filter((item) => !onlyEquipped || item.isActive)
        .flatMap((item) => [...(item.system.weaponGroups?.total ?? [])])
        .map(x => x.trim())
        .filter(truthiness);

    const groups = uniqueArray([
        ...equiped,
        ...(onlyEquipped ? [] : Object.keys(pf1.config.weaponGroups)),
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
