import { localize } from "../../util/localize.mjs";

/**
 * @abstract
 */
export class BaseTarget {

    /**
     * Key for flag on bonustarget
     * @returns { string }
     */
    static get key() { return `target_${this.type}`; }

    /**
     * Label for this bonustarget
     * @returns { string }
     */
    static get label() { return localize(`bonus.target.label.${this.type}`); }

    /**
     * @abstract
     * @returns { string }
     */
    static get type() { throw new Error('must be overridden'); }

    /**
     * Get Item Hints tooltip value
     *
     * @abstract
     * @param {ItemPF} bonus
     * @returns {Nullable<string[]>}
     */
    static getHints(bonus) { return; }

    /**
     * If the arg is targeted by this
     *
     * @abstract
     * @param {ItemPF | ActionUse | ItemAction} arg
     * @returns {ItemPF[]}
     */
    static getBonusSourcesForTarget(arg) { throw new Error('must be overridden'); };

    /**
     * @abstract
     * @param {object} options
     * @param {ActorPF | null} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ actor, item, html }) { throw new Error("must be overridden."); }
}
