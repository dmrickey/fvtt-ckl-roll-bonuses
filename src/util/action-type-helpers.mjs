import { api } from './api.mjs';

/** @type {ActionTypeFilterFunc} */
export const isMelee = (_item, action) => ['mwak', 'msak', 'mcman'].includes(action?.actionType ?? '');

/** @type {ActionTypeFilterFunc} */
export const isNatural = (item) => {
    const isAttack = item instanceof pf1.documents.item.ItemAttackPF;
    return (isAttack && item.subType === 'natural')
        || !!item?.system.weaponGroups?.total?.has("natural");
}

/** @type {ActionTypeFilterFunc} */
export const isNaturalSecondary = (item, action, actionUse) => {
    const _isNatural = isNatural(item);
    const isPrimary = !!action?.naturalAttack.primary;
    return _isNatural && !isPrimary;
}

/**@type {ActionTypeFilterFunc}*/
export const isPhysical = (item, _action) => !!item?.isPhysical;

/**@type {ActionTypeFilterFunc}*/
export const isRanged = (_item, action) => ['rcman', 'rwak', 'rsak', 'twak'].includes(action?.actionType ?? '');

/** @type {ActionTypeFilterFunc} */
export const isSpell = (item, action) => {
    const isSpell = item instanceof pf1.documents.item.ItemSpellPF;
    return isSpell || ['msak', 'rsak', 'spellsave'].includes(action?.actionType ?? '');
}

/**@type {ActionTypeFilterFunc}*/
export const isThrown = (_item, action) => action?.actionType === 'twak';

/**@type {ActionTypeFilterFunc}*/
export const isWeapon = (item, action) => ['mwak', 'rwak', 'twak'].includes(action?.actionType ?? '') || isNatural(item);

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
