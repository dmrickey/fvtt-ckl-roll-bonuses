import { BaseSource } from '../_base-source.mjs';

/** @abstract */
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
     * @param {ActionUse | ItemAction} [action] The thing for the source is being applied to for contextually aware bonuses
     * @returns {Nullable<ItemConditional[]>}
     */
    static getConditionals(source, action) { return null; }

    /**
     * Add damage bonus to actor's Combat damage column tooltip
     *
     * @abstract
     * @param {ItemPF} source
     * @param {ItemPF} thing The thing for the source is being applied to for contextually aware bonuses
     * @returns {ItemChange[]}
     */
    static getDamageSourcesForTooltip(source, thing) { return []; }

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
     * use either this or @see {@link getConditionals}
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
     * Modify enhancement bonus
     *
     * @abstract
     * @param {ItemPF} source
     * @param {{base: number, stacks: number}} seed
     * @param {ItemAction} action
     */
    static itemActionEnhancementBonus(source, seed, action) { }

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
     * Only use this when modifying Roll Data isn't sufficient as that covers a lot more cases.
     *
     * @abstract
     * @param {ItemPF} _sourceItem
     * @param {ItemAction} _action
     * @param {{proficient: boolean, secondaryPenalty: boolean}} _config
     * @param {RollData} _rollData
     * @param {object} _rollOptions
     * @param {string[]} _parts
     * @param {ItemChange[]} _changes
     */
    static modifyPreRollAttack(_sourceItem, _action, _config, _rollData, _rollOptions, _parts, _changes) { }

    /**
     * Returns true the targeting is too generic to show a hint on a specific item
     * - used for something like `crit` that needs to combine all hints in a single registration
     *
     * @abstract
     * @returns {boolean}
     */
    static get skipTargetedHint() { return false; }

    /**
     * Get Critical parts for chat attack
     *
     * @abstract
     * @param {ItemPF} source
     * @returns {Nullable<string | string[]>}
     */
    static getCritBonusParts(source) { return; }

    /**
     * @abstract
     * @param {ItemPF} source
     * @param {ItemAction} action
     * @param {RollData} rollData
     */
    static updateItemActionRollData(source, action, rollData) { }

    /**
     * Alter ActionUse (shared data) before action is used
     *
     * @abstract
     * @param {ItemPF} source
     * @param {ActionUse} actionUse
     */
    static actionUseProcess(source, actionUse) { }

    /**
     * @abstract
     * @param {ItemPF} source
     * @param {ItemAction} action
     * @returns {number}
     */
    static modifyActionLabelDC(source, action) { return 0; }

    /**
     * @abstract
     * @param {ItemPF} source The source of the bonus
     * @param {(ActionUse | ItemPF | ItemAction)?} [item] The item receiving the bonus for contextually aware hints.
     * @returns {ParsedContextNoteEntry[] | undefined}
     */
    static getFootnotes(source, item) { return []; }

    /**
     * Returns true if this bonus is a conditional bonus.
     * @abstract
     */
    static get isConditionalBonus() { return false; }
}
