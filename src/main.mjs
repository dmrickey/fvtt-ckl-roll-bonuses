import { FRIENDLY_MODULE_NAME, MODULE_NAME } from './consts.mjs';
import { LocalHookHandler, customGlobalHooks, localHooks } from './util/hooks.mjs';
import './handlebars-handlers/init.mjs';
import './util/item-hints.mjs';
import './bonuses.mjs';
import './patch/init.mjs';
import { FormulaCacheHelper } from './util/flag-helpers.mjs';
import { simplifyRollFormula } from './util/simplify-roll-formula.mjs';
import './auto-recognition/init.mjs';
import { api } from './util/api.mjs';
import './overrides/action-damage.mjs';
import migrate from './migration/index.mjs';

Hooks.once('ready', () => game.modules.get(MODULE_NAME).api = api);
Hooks.once('pf1PostReady', () => migrate());

/**
 * @param {() => any} wrapped
 * @this {ChatAttack}
*/
function setAttackNotesHTMLWrapper(wrapped) {
    Hooks.call(customGlobalHooks.chatAttackFootnotes, this);
    return wrapped();
}

/**
 * Used to alter the roll. The roll can be inspected, then replaced.
 *
 * @param {(args: any) => Promise<any>} wrapped
 * @param {object} obj
 * @param {boolean} [obj.noAttack]
 * @param {unknown} [obj.bonus]
 * @param {unknown[]} [obj.extraParts]
 * @param {boolean} [obj.critical] Whether or not this roll is a for a critical confirmation
 * @param {object} [obj.conditionalParts]
 * @this {ChatAttack}
 */
async function chatAttackAddAttack(wrapped, { noAttack = false, bonus = null, extraParts = [], critical = false, conditionalParts = {} }) {
    await wrapped({ noAttack, bonus, extraParts, critical, conditionalParts });
    await LocalHookHandler.fireHookNoReturnAsync(localHooks.chatAttackAddAttack, this, { noAttack, bonus, extraParts, critical, conditionalParts });
}

/**
 * @param {() => any} wrapped
 * @this {ChatAttack}
 */
function setEffectNotesHTMLWrapper(wrapped) {
    Hooks.call(customGlobalHooks.chatAttackEffectNotes, this);
    return wrapped();
}

/**
 * @param {() => number | string} wrapped
 * @this ItemChange
 */
function patchChangeValue(wrapped) {
    const seed = wrapped();
    const value = LocalHookHandler.fireHookWithReturnSync(localHooks.patchChangeValue, seed, this);
    return value;
}

/**
 * @param {*} wrapped
 * @param {*} options
 * @this {d20Roll}
 * @returns The result of the original method.
 */
function d20RollWrapper(wrapped, options = {}) {
    Hooks.call(customGlobalHooks.d20Roll, options);
    return wrapped.call(this, options);
}

/**
 * @param {*} wrapped
 * @this {ItemPF}
 */
function prepareItemData(wrapped) {
    wrapped();

    const item = this;
    /**
     * initialize module data but make the individual portions initialize their own specific data so this part of the app doesn't need to know about all the properties/types
     *  @type {any}
     */
    const empty = {};
    item[MODULE_NAME] = empty;
    const rollData = item.getRollData();
    FormulaCacheHelper.cacheFormulas(item, rollData)
    LocalHookHandler.fireHookNoReturnSync(localHooks.prepareData, item, rollData);
}

/**
 * @param {*} wrapped - original method
 * @param {*} options - options passed to ItemPF.use
 * @this {ItemPF}
 * @returns The result of the original method.
 */
function itemUseWrapper(wrapped, options = {}) {
    Hooks.call(customGlobalHooks.itemUse, this, options);
    return wrapped.call(this, options);
}

/**
 * @param {(arg: object) => any} wrapped
 * @param {object} e - The attack dialog's JQuery form data or FormData object
 * @this ActionUse
 */
function actionUseAlterRollData(wrapped, e) {
    wrapped(e);
    Hooks.call(customGlobalHooks.actionUseAlterRollData, this);
}

/**
 * Used for adding conditionals to individual parts of full attacks
 *
 * @param {(arg: object, options: { index: number}) => any} wrapped
 * @param {object} atk - The attack used.
 * @param {object} options
 * @param {number} [options.index=0] - The index of the attack, in order of enabled attacks.
 * @returns {object} The conditional parts used.
 * @this ActionUse
 */
function getConditionalParts(wrapped, atk, { index = 0 }) {
    var result = wrapped(atk, { index });
    Hooks.call(customGlobalHooks.getConditionalParts, this, result, atk, index);
    return result;
}

/**
 * @param {()=> number} wrapped
 * @this {ItemAction}
 * @returns {number}
 */
function itemActionCritRangeWrapper(wrapped) {
    var current = wrapped();

    const result = LocalHookHandler.fireHookWithReturnSync(localHooks.itemActionCritRangeWrapper, current, this);
    return result;
}

/**
 * Determines conditional parts used in an attack.
 *
 * @param {() => {}} wrapped
 * @this ActionUse
 */
function actionUseHandleConditionals(wrapped) {
    wrapped();
    Hooks.call(customGlobalHooks.actionUseHandleConditionals, this);
}

/**
 * Add attack bonus to actor's Combat attacks column tooltip
 *
 * @param {(actionId: string) => any} wrapped
 * @param {string} actionId
 * @this {ItemPF}
 */
function itemGetAttackSources(wrapped, actionId) {
    const sources = wrapped(actionId);
    Hooks.call(customGlobalHooks.itemGetAttackSources, this, sources);
    return sources;
}

/**
 * Add info to chat card
 * @param {*} wrapped
 * @param {object} data
 * @param {Object<string, string>} labels
 * @param {string[]} props
 * @param {RollData} rollData
 * @this {ItemPF}
 */
function itemGetTypeChatData(wrapped, data, labels, props, rollData) {
    wrapped(data, labels, props, rollData);
    Hooks.call(customGlobalHooks.itemGetTypeChatData, this, props, rollData);
}

/**
 * Get damage sources for actor's combat tooltips
 * @param {() => any} wrapped
 * @this {ItemAction}
 */
function actionDamageSources(wrapped) {
    const sources = wrapped();
    Hooks.call(customGlobalHooks.actionDamageSources, this, sources);
    return sources;

    // const filtered = getHighestChanges(sources, { ignoreTarget: true });
    // return filtered;
}

/**
 * Safely get the result of a roll, returns 0 if unsafe.
 * @param {string | number} formula - The string that should resolve to a number
 * @param {Nullable<RollData>} data - The roll data used for resolving any variables in the formula
 * @returns {number}
 */
function safeTotal(
    formula,
    data,
) {
    return (isNaN(+formula) ? RollPF.safeRoll(formula, data).total : +formula) || 0;
}

/**
 * @param {() => any} wrapped
 * @this {ActorPF}
 */
function prepareActorDerivedData(wrapped) {
    wrapped();
    this[MODULE_NAME] ||= {};
    LocalHookHandler.fireHookNoReturnSync(localHooks.postPrepareActorDerivedData, this);
}

/**
 * @param {ActorPF | ItemPF | ItemAction} action
 * @param {RollData} rollData
 */
function updateItemActionRollData(action, rollData) {
    if (!(action instanceof pf1.components.ItemAction)) return;

    // safety for initialization during data prep where the bonuses havent' been set up yet
    if (!action.item[MODULE_NAME]?.bonuses || !action.item[MODULE_NAME]?.bonuses) return;

    rollData[MODULE_NAME] ||= {};
    LocalHookHandler.fireHookNoReturnSync(localHooks.updateItemActionRollData, action, rollData);
}
Hooks.on('pf1GetRollData', updateItemActionRollData);

/**
 * @typedef {{data: RollData?, extraParts: unknown[], bonus:unknown, primaryAttack: boolean}} RollAttackArgs
 */
/**
 * Place an attack roll using an item (weapon, feat, spell, or equipment)
 *
 * @param {(arg: RollAttackArgs) => Promise<D20RollPF>} wrapped
 * @param {object} [args]
 * @param {RollData?} [args.data]
 * @param {unknown[]} [args.extraParts]
 * @param {unknown} [args.bonus]
 * @param {boolean} [args.primaryAttack]
 * @this {ItemAction}
 */
async function itemActionRollAttack(
    wrapped,
    { data = null, extraParts = [], bonus = null, primaryAttack = true } = {}
) {
    const roll = await wrapped({ data, extraParts, bonus, primaryAttack });

    const formula = roll.formula;
    const options = roll.options;
    const rollData = roll.data;
    const seed = { formula, options };
    LocalHookHandler.fireHookNoReturnSync(localHooks.itemActionRollAttack, seed, this, rollData);

    if (formula !== seed.formula || !foundry.utils.objectsEqual(options, seed.options)) {
        const replaced = await new pf1.dice.D20RollPF(seed.formula, rollData, seed.options).evaluate();
        return replaced;
    }
    return roll;
}

/**
 * @param {(...arg: any[] ) => Promise<DamageRoll[]>} wrapped
 * @param {any[]} args
 * @this {ItemAction}
 */
async function itemActionRollDamage(wrapped, ...args) {
    const rolls = await wrapped(...args);
    let i = 0;
    for (const roll of rolls) {
        const formula = roll.formula;
        const options = roll.options;
        const rollData = roll.data;
        const seed = { formula, options };
        LocalHookHandler.fireHookNoReturnSync(localHooks.itemActionRollDamage, seed, this, rollData);

        if (formula !== seed.formula || !foundry.utils.objectsEqual(options, seed.options)) {
            const replaced = await new pf1.dice.DamageRoll(seed.formula, rollData, seed.options).evaluate();
            rolls[i] = replaced;
        }
        i++;
    }

    return rolls;
}

/**
 * @param {(skillId: string, options: object) => ChatMessagePF|object|void} wrapped
 * @param {string} skillId
 * @param {Object} options
 * @this {ActorPF}
 * @returns {ChatMessagePF|object|void} The chat message if one was created, or its data if not. `void` if the roll was cancelled.
 */
function actorRollSkill(wrapped, skillId, options) {
    return wrapped(skillId, options);
}

/**
 * @param {(skillId: string, options?: { rollData?: RollData }) => SkillRollData} wrapped
 * @param {keyof typeof pf1.config.skills} skillId
 * @param {object} [options]
 * @param {RollData} [options.rollData]
 * @this {ActorPF}
 * @return {SkillRollData}
 */
function actorGetSkillInfo(wrapped, skillId, { rollData } = {}) {
    return wrapped(skillId, { rollData });
}

Hooks.once('init', () => {
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ActionUse.prototype._getConditionalParts', getConditionalParts, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ActionUse.prototype.alterRollData', actionUseAlterRollData, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ActionUse.prototype.handleConditionals', actionUseHandleConditionals, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ChatAttack.prototype.addAttack', chatAttackAddAttack, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ChatAttack.prototype.setAttackNotesHTML', setAttackNotesHTMLWrapper, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ChatAttack.prototype.setEffectNotesHTML', setEffectNotesHTMLWrapper, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.components.ItemAction.prototype.damageSources', actionDamageSources, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.components.ItemChange.prototype.value', patchChangeValue, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.dice.d20Roll', d20RollWrapper, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.item.ItemPF.prototype.getAttackSources', itemGetAttackSources, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.item.ItemPF.prototype.getTypeChatData', itemGetTypeChatData, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.item.ItemPF.prototype.prepareDerivedItemData', prepareItemData, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.item.ItemPF.prototype.use', itemUseWrapper, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.item.ItemSpellPF.prototype.getTypeChatData', itemGetTypeChatData, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.components.ItemAction.prototype.critRange', itemActionCritRangeWrapper, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.actor.ActorPF.prototype.prepareSpecificDerivedData', prepareActorDerivedData, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.components.ItemAction.prototype.rollAttack', itemActionRollAttack, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.components.ItemAction.prototype.rollDamage', itemActionRollDamage, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.actor.ActorPF.prototype.rollSkill', actorRollSkill, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.actor.ActorPF.prototype.getSkillInfo', actorGetSkillInfo, libWrapper.WRAPPER);
    // for patching resources - both
    // libWrapper.register(MODULE_NAME, 'pf1.documents.item.ItemPF.prototype._updateMaxUses', updateMaxUses, libWrapper.WRAPPER);
    // pf1.documents.actor.ActorPF.prototype.updateItemResources

    RollPF.safeTotal = safeTotal;
    Object.defineProperty(
        RollPF.prototype,
        'simplifiedFormula',
        {
            /** @this {RollPF} */
            get: function () { return simplifyRollFormula(this.formula, { preserveFlavor: true }); }
        }
    );
    Object.defineProperty(
        RollPF.prototype,
        'isNumber',
        {
            /** @this {RollPF} */
            get: function () { return this.isDeterministic && !this.terms.every((x) => !!x.flavor); }
        }
    );

    console.log(`${FRIENDLY_MODULE_NAME} loaded`);
});
