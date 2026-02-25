import { api } from './api.mjs';

/**
 * @param {ItemWeaponPF | ItemAttackPF} item 
 * @returns 
 */
export const isEquipped = (item) => (item instanceof pf1.documents.item.ItemWeaponPF && item.system.equipped) || item.system.subType === 'natural';

api.utils.isEquipped = isEquipped;
