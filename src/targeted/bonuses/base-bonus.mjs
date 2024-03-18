import { localize } from "../../util/localize.mjs";
import { localHooks } from "../../util/hooks.mjs";

/**
 * @abstract
 */
export class BaseBonus {

    /**
     * @returns { string }
     */
    static get key() { return `bonus_${this.type}`; }

    /**
     * @returns { string }
     */
    static get label() { return localize(`bonus-target.bonus.label.${this.type}`); }

    /**
     * @abstract
     * @returns { string }
     */
    static get type() { throw new Error('must be overridden'); }

    /**
     * If the item is providing this bonus
     *
     * @param {ItemPF} item
     * @returns {boolean}
     */
    static isBonusSource(item) { return item.hasItemBooleanFlag(this.key); };

    /**
     * @abstract
     * @param {object} options
     * @param {ActorPF | null} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ actor, item, html }) { throw new Error("must be overridden."); }

    /**
     * Get Item Hints tooltip value
     *
     * @abstract
     * @param {ItemPF} bonus The source of the bonus
     * @param {ItemPF?} [item] The item receiving the bonus for contextually aware hints.
     * @returns {Nullable<string[]>}
     */
    static getHints(bonus, item) { return; }

    /**
     * Gets Conditional used for the action
     * use either this or @see {@link actionUseAlterRollData}
     *
     * @abstract
     * @param {ItemPF} target
     * @returns {Nullable<ItemConditional>}
     */
    static getConditional(target) { return null; }

    // /**
    //  * @abstract
    //  * @param {ActionUse} actionUse
    //  * @returns {Nullable<ItemConditional>}
    //  */
    // static getDamageBonusesForRoll({ actor, item, shared }) { return; }

    /**
     * Add damage bonus to actor's Combat damage column tooltip
     *
     * @abstract
     * @param {ItemPF} target
     * @returns {ItemChange[]}
     */
    static getDamageSourcesForTooltip(target) { return []; }

    /**
     * Add attack bonus to actor's Combat attacks column tooltip
     *
     * @abstract
     * @param {ItemPF} target
     * @returns {ModifierSource[]}
     */
    static getAttackSourcesForTooltip(target) { return []; }

    /**
     * Alters roll data for attack rolls - for simple changes that don't need an ItemConditional/Modifier or ItemChange
     * use either this or @see {@link getConditional}
     *
     * @abstract
     * @param {ItemPF} target
     * @param {ActionUseShared} shared
     */
    static actionUseAlterRollData(target, shared) { }

    /**
     * alters item use input via @see {@link localHooks.itemUse}
     *
     * @abstract
     * @param {ItemPF} bonusTarget
     * @param {{ fortuneCount: number; misfortuneCount: number; actionID: any; }} options passed into ItemPF.use
     */
    static onItemUse(bonusTarget, options) { }

    /**
     * Initializes anything specific to the bonus
     *
     * @abstract
     */
    static init() { }
}
