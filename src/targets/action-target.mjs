import { BaseAttackTarget } from "./base-target.mjs";

export class ActionTarget extends BaseAttackTarget {
    /** @type {string[]} */
    ids = [];

    /**
     * @inheritdoc
     * @override
     * @returns {'action'}
     */
    get type() { return 'action'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF | ActionUse} arg
     * @returns {boolean}
     */
    isTarget(arg) {
        if (arg instanceof pf1.components.ItemAction) {
            return this.ids.includes(arg.id);
        }

        return false;
    }
}
