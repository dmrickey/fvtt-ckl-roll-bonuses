import { intersects } from "../util/array-intersects.mjs";
import { BaseTarget } from "./base-target.mjs";

export class WeaponTypeTarget extends BaseTarget {
    /** @type {string[]} */
    baseTypes = [];

    /**
     * @inheritdoc
     * @override
     */
    static get type() { return 'weapon-type'; }

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
