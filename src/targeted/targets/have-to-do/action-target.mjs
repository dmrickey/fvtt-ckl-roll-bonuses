// @ts-nocheck
import { BaseTarget } from "../base-target.mjs";

export class ActionTarget extends BaseTarget {
    /** @type {string[]} */
    ids = [];

    /**
     * @inheritdoc
     * @override
     */
    static get type() { return 'action'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF | ActionUse} arg
     * @returns {boolean}
     */
    static getBonusSourcesForTarget(arg) {
        if (arg instanceof pf1.components.ItemAction) {
            return this.ids.includes(arg.id);
        }

        return false;
    }
}
