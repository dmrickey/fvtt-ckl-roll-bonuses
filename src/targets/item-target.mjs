import { BaseAttackTarget } from "./base-target.mjs";

export class ItemTarget extends BaseAttackTarget {
    /** @type {string[]} */
    ids = [];

    /**
     * @inheritdoc
     * @override
     * @returns {'item'}
     */
    get type() { return 'item'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF | ActionUse} arg
     * @returns {boolean}
     */
    isTarget(arg) {
        if (arg instanceof pf1.components.ItemAction) {
            // todo pf1 v10
            // return intersects(this.ids, arg.links?.parents?.map(x => x.id) ?? []);
            return false;
        }

        if (arg instanceof pf1.documents.item.ItemAttackPF || arg instanceof pf1.documents.item.ItemWeaponPF) {
            return this.ids.includes(arg.id);
        }

        return false;
    }
}
