import { BaseIsItemTarget } from './base-is-item-target.mjs';

export class IsNaturalTarget extends BaseIsItemTarget {

    /**
     * @override
     */
    static get sourceKey() { return 'is-natural'; }

    /**
     * @override
     * @param {object} args
     * @param {Nullable<ItemAction>} [args.action]
     * @returns {boolean}
     */
    static extendedItemFilter({ action = null }) {
        const item = action?.item;

        const isAttack = item instanceof pf1.documents.item.ItemAttackPF;
        const isWeapon = item instanceof pf1.documents.item.ItemWeaponPF;
        return (isAttack && item.subType === 'natural')
            || ((isAttack || isWeapon) && item.system.weaponGroups?.value.includes("natural"));
    }
}
