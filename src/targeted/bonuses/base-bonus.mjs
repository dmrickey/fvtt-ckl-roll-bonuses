import { customGlobalHooks } from "../../util/hooks.mjs";
import { BaseSource } from '../base-source.mjs';

/**
 * @abstract
 */
export class BaseBonus extends BaseSource {

    /**
     * @override
     * @returns { string }
     */
    static get sourceBaseType() { return 'bonus'; }

    /**
     * Gets Conditional used for the action
     * use either this or @see {@link actionUseAlterRollData}
     *
     * @abstract
     * @param {ItemPF} source
     * @param {ActionUse | ItemAction} action The thing for the source is being applied to for contextually aware bonuses
     * @returns {Nullable<ItemConditional>}
     */
    static getConditional(source, action) { return null; }

    /**
     * Add damage bonus to actor's Combat damage column tooltip
     *
     * @abstract
     * @param {ItemPF} source
     * @param {ItemAction} action The thing for the source is being applied to for contextually aware bonuses
     * @returns {ItemChange[]}
     */
    static getDamageSourcesForTooltip(source, action) { return []; }

    /**
     * Add attack bonus to actor's Combat attacks column tooltip
     *
     * @abstract
     * @param {ItemPF} source
     * @param {ItemPF} item The thing for the source is being applied to for contextually aware bonuses
     * @returns {ModifierSource[]}
     */
    static getAttackSourcesForTooltip(source, item) { return []; }

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
     * Get extra info tags for the chat card for the owner to see
     *
     * @abstract
     * @param {ItemPF} source
     * @param {RollData} rollData
     * @returns {Nullable<string[]>}
     */
    static getItemChatCardInfo(source, rollData) { return; }

    /**
     * @abstract
     * @param {ItemPF} _source
     * @param {ItemActionRollAttackHookArgs} _seed
     * @param {ItemAction} _action
     * @param {RollData} _data
     */
    static itemActionRollAttack(_source, _seed, _action, _data) { }

    /**
     * @abstract
     * @param {ItemPF} _source
     * @param {ItemActionRollAttackHookArgs} _seed
     * @param {ItemAction} _action
     * @param {RollData} _data
     * @param {number} _index
     */
    static itemActionRollDamage(_source, _seed, _action, _data, _index) { }

    /**
     * Returns true the targeting is too generic to show a hint on a specific item
     * - used for something like `crit` that needs to combine all hints in a single registration
     *
     * @abstract
     * @returns {boolean}
     */
    static get skipTargetedHint() { return false; }

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
     * @abstract
     * @param {ItemPF} source The source of the bonus
     * @param {(ActionUse | ItemPF | ItemAction)?} [item] The item receiving the bonus for contextually aware hints.
     * @returns {string[]}
     */
    static getFootnotes(source, item) { return []; }
}
