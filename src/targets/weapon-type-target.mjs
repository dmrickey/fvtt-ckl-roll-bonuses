import { intersects } from "../util/array-intersects.mjs";
import { BaseAttackTarget } from "./base-target.mjs";

export class WeaponTypeTarget extends BaseAttackTarget {
    /** @type {string[]} */
    baseTypes = [];

    /**
     * @inheritdoc
     * @override
     * @returns {'equipment-type'}
     */
    get type() { return 'equipment-type'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF | ActionUse} item
     * @returns {boolean}
     */
    isTarget(item) {
        if (!(item instanceof pf1.documents.item.ItemAttackPF
            || item instanceof pf1.documents.item.ItemWeaponPF)
        ) {
            return false;
        }
        if (!item.system.baseTypes) {
            return false;
        }

        return intersects(item.system.baseTypes, this.baseTypes);
    }
}
