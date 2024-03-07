import { localize } from "../../util/localize.mjs";

/**
 * @abstract
 */
export class BaseTarget {

    /**
     * If the arg is targeted by this
     *
     * @abstract
     * @param {ItemPF | ActionUse | ItemAction} arg
     * @returns {ItemPF[]}
     */
    static getBonusSourcesForTarget(arg) { throw new Error('must be overridden'); };

    /**
     * Get Item Hints tooltip value
     *
     * @abstract
     * @param {ItemPF} bonus
     * @returns {Nullable<string[]>}
     */
    static getHints(bonus) { return; }

    /**
     * Initialize any target-specific settings.
     *
     * @abstract
     */
    static init() { }

    /**
     * Returns true the targeting is too generic to show a hint on a specific item.
     *
     * @abstract
     * @returns {boolean}
     */
    static get isGenericTarget() { return false; }

    /**
     * Key for flag on bonustarget
     * @returns { string }
     */
    static get key() { return `target_${this.targetKey}`; }

    /**
     * Label for this bonustarget
     * @returns { string }
     */
    static get label() { return localize(`bonus.target.label.${this.targetKey}`); }

    /**
     * @abstract
     * @param {object} options
     * @param {ActorPF | null} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ actor, item, html }) { throw new Error("must be overridden."); }

    /**
     * Returns true if this target should show its editor when the Item is made is active
     *
     * @abstract
     * @returns {boolean}
     */
    static get showOnActive() { return false; }

    /**
     * Shows editor for target
     *
     * @param {ItemPF} item
     */
    static showTargetEditor(item) { }

    /**
     * @abstract
     * @returns { string }
     */
    static get targetKey() { throw new Error('must be overridden'); }
}
