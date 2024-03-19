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
     * For a given target source, does it target the `thing`?
     * @param {ItemPF} targetSource
     * @param {ActionUse | ItemPF | ItemAction} thing
     * @returns {boolean} True if this target source applies to the `thing`
     */
    static doesTargetInclude(targetSource, thing) {
        return !!this.getBonusSourcesForTarget(thing).find((bonusSource) => bonusSource.id === targetSource.id);
    }

    /**
     * Get Item Hints tooltip value
     *
     * @abstract
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) { return; }

    /**
     * Initialize any target-specific settings.
     *
     * @abstract
     */
    static init() { }

    /**
     * Returns true the targeting is too generic to show a hint on a specific item
     * - generally means this is a "token" target that does not have a specific targeted item
     * - also used for "self item targets" which already show the bonus, so don't need to show the target as well on the same item
     *
     * @abstract
     * @returns {boolean}
     */
    static get isGenericTarget() { return false; }

    /**
     * If the item is a source for this target
     *
     * @param {ItemPF} source
     * @returns {boolean}
     */
    static isTargetSource(source) { return source.hasItemBooleanFlag(this.key); };

    /**
     * Key for flag on target source
     * @returns { string }
     */
    static get key() { return `target_${this.targetKey}`; }

    /**
     * Label for this target source
     * @returns { string }
     */
    static get label() { return localize(`bonus-target.target.label.${this.targetKey}`); }

    /**
     * @abstract
     * @param {object} options
     * @param {ActorPF | null} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ actor, item, html }) { throw new Error('must be overridden.'); }

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
     * @param {ItemPF} source
     */
    static showTargetEditor(source) { }

    /**
     * @abstract
     * @returns { string }
     */
    static get targetKey() { throw new Error('must be overridden'); }

    // /**
    //  * Skip
    //  * @returns {boolean}
    //  */
    // static get skipTargetHint { return false; }
}
