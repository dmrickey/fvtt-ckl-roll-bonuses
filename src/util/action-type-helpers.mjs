import { api } from './api.mjs';

/** @type {ActionTypeFilterFunc} */
export const isMelee = (_item, action) => ['mwak', 'msak', 'mcman'].includes(action?.data.actionType ?? '');

/** @type {ActionTypeFilterFunc} */
export const isNatural = (item) => {
    const isAttack = item instanceof pf1.documents.item.ItemAttackPF;
    return (isAttack && item.subType === 'natural')
        || !!item.system.weaponGroups?.total?.has("natural");
}

/** @type {ActionTypeFilterFunc} */
export const isNaturalSecondary = (item, action, actionUse) => {
    const _isNatural = isNatural(item);
    const isPrimary = action?.data.naturalAttack.primaryAttack;
    return _isNatural && !isPrimary;
}

/**@type {ActionTypeFilterFunc}*/
export const isPhysical = (item, action) => !!item?.isPhysical;

/**@type {ActionTypeFilterFunc}*/
export const isRanged = (_item, action) => ['rcman', 'rwak', 'rsak', 'twak'].includes(action?.data.actionType ?? '');

/** @type {ActionTypeFilterFunc} */
export const isSpell = (item, action) => {
    const isSpell = item instanceof pf1.documents.item.ItemSpellPF;
    return isSpell || ['msak', 'rsak', 'spellsave'].includes(action?.data.actionType ?? '');
}

/**@type {ActionTypeFilterFunc}*/
export const isThrown = (_item, action) => action?.data.actionType === 'twak';

/**@type {ActionTypeFilterFunc}*/
export const isWeapon = (item, action) => ['mwak', 'rwak', 'twak'].includes(action?.data.actionType ?? '') || isNatural(item);

api.utils.actionTypeHelpers = {
    isMelee,
    isNatural,
    isNaturalSecondary,
    isPhysical,
    isRanged,
    isSpell,
    isThrown,
    isWeapon,
};
