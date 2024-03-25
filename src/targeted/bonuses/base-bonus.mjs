import { localizeTargetedBonusHint, localizeTargetedBonusLabel } from "../../util/localize.mjs";
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
    static get label() { return localizeTargetedBonusLabel(this.sourceKey); }

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
     * @param {ItemPF} _source
     * @param {ItemActionRollAttackHookArgs} seed
     * @param {ItemAction} _action
     * @param {RollData} _data
     * @returns {ItemActionRollAttackHookArgs}
     */
    static itemActionRollDamage(_source, seed, _action, _data) { return seed; }

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

    /**
     * @override
     * @inheritdoc
     * @returns { string }
     */
    static get tooltip() { return localizeTargetedBonusHint(this.sourceKey); }
}
