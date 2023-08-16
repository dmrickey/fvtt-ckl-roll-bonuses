import { ActionTarget } from "./ideas/action-target.mjs";
import { BaseTarget } from "./base-target.mjs";
import { DamageTypeTarget } from "./have-to-do/damage-type-target.mjs";
import { ItemTarget } from "./have-to-do/item-target.mjs";
import { WeaponGroupTarget } from "./weapon-group-target.mjs";
import { WeaponTypeTarget } from "./weapon-type-target.mjs";

Hooks.on('ready', () => {
    targetTypes = {
        ['action']: 'Action',
        ['damage-type']: 'Damage Type',
        ['item']: 'Item',
        ['weapon-group']: 'Weapon Group',
        ['weapon-type']: 'Weapon Type',
    };
});

export let targetTypes = {};

/** @type {typeof BaseTarget[]} */
export const allTargets = [
    // ActionTarget,
    // DamageTypeTarget,
    // ItemTarget,
    WeaponGroupTarget,
    WeaponTypeTarget,
];
