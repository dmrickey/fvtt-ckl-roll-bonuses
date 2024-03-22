import { localizeTargetedBonusLabel } from "../../util/localize.mjs";
import { customGlobalHooks } from "../../util/hooks.mjs";

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
    static get label() { return localizeTargetedBonusLabel(this.type); }

    /**
     * @abstract
     * @returns { string }
     */
    static get type() { throw new Error('must be overridden'); }

    /**
     * If the item is a source for this bonus
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
     * @param {ItemPF} source The source of the bonus
     * @param {(ActionUse | ItemPF | ItemAction)?} [target] The target for contextually aware hints
     * @returns {Nullable<string[]>}
     */
    static getHints(source, target = undefined) { return; }

    /**
     * Gets Conditional used for the action
     * use either this or @see {@link actionUseAlterRollData}
     *
     * @abstract
     * @param {ItemPF} source
     * @returns {Nullable<ItemConditional>}
     */
    static getConditional(source) { return null; }

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
     * @param {ItemPF} source
     * @returns {ItemChange[]}
     */
    static getDamageSourcesForTooltip(source) { return []; }

    /**
     * Add attack bonus to actor's Combat attacks column tooltip
     *
     * @abstract
     * @param {ItemPF} source
     * @returns {ModifierSource[]}
     */
    static getAttackSourcesForTooltip(source) { return []; }

    /**
     * Alters roll data for attack rolls - for simple changes that don't need an ItemConditional/Modifier or ItemChange
     * use either this or @see {@link getConditional}
     *
     * @abstract
     * @param {ItemPF} source
     * @param {ActionUseShared} shared
    */
    static actionUseAlterRollData(source, shared) { }

    /**
     * @abstract
     * @param {ItemPF} _source
     * @param {ItemActionRollAttackHookArgs} seed
     * @param {ItemAction} _action
     * @param {RollData} _data
     * @returns {ItemActionRollAttackHookArgs}
     */
    static itemActionRollAttack(_source, seed, _action, _data) { return seed; }

    /**
     * @abstract
      * @param {ItemPF} source
      * @param {ItemAction} action
      * @param {RollData} rollData
      */
    static updateItemActionRollData(source, action, rollData) { }

    /**
     * alters item use input via @see {@link customGlobalHooks.itemUse}
     *
     * @abstract
     * @param {ItemPF} source
     * @param {{ fortuneCount: number; misfortuneCount: number; actionID: any; }} options passed into ItemPF.use
     */
    static onItemUse(source, options) { }

    /**
     * Initializes anything specific to the bonus
     *
     * @abstract
     */
    static init() { }

    /**
     * @abstract
     * @param {ItemPF} source The source of the bonus
     * @param {(ActionUse | ItemPF | ItemAction)?} [item] The item receiving the bonus for contextually aware hints.
     * @returns {string[]}
     */
    static getFootnotes(source, item) { return []; }
}
