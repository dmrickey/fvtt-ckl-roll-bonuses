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
     * @returns {boolean} True if this target source applies to this thing
     */
    static doesTargetInclude(targetSource, thing) {
        return !!this.getBonusSourcesForTarget(thing).find((source) => source.id === targetSource.id);
    }

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
     * Returns true the targeting is too generic to show a hint on a specific item (generally means this is a "token" target that does not have a specific targeted item).
     *
     * @abstract
     * @returns {boolean}
     */
    static get isGenericTarget() { return false; }

    /**
     * If the item is providing this target
     *
     * @param {ItemPF} item
     * @returns {boolean}
     */
    static isTargetSource(item) { return item.hasItemBooleanFlag(this.key); };

    /**
     * Key for flag on bonustarget
     * @returns { string }
     */
    static get key() { return `target_${this.targetKey}`; }

    /**
     * Label for this bonustarget
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
     * @param {ItemPF} item
     */
    static showTargetEditor(item) { }

    /**
     * @abstract
     * @returns { string }
     */
    static get targetKey() { throw new Error('must be overridden'); }
}
