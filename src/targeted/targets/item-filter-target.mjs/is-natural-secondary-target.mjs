import { BaseIsItemTarget } from './base-is-item-target.mjs';

export class IsNaturalSecondaryTarget extends BaseIsItemTarget {

    /**
     * @override
     */
    static get sourceKey() { return 'is-natural-secondary'; }

    /**
     * @override
     * @param {object} args
     * @param {Nullable<ItemAction>} [args.action]
     * @returns {boolean}
     */
    static extendedItemFilter({ action = null }) {
        if (!action) return false;
        const item = action?.item;

        const isAttack = item instanceof pf1.documents.item.ItemAttackPF;
        const isWeapon = item instanceof pf1.documents.item.ItemWeaponPF;
        const isNatural = (isAttack && item.subType === 'natural')
            || ((isAttack || isWeapon) && item.system.weaponGroups?.value.includes("natural"));

        const isPrimary = action.data.naturalAttack.primaryAttack;

        return isNatural && !isPrimary;
    }
}
