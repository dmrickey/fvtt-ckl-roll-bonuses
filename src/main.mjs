import { MODULE_NAME } from './consts.mjs';

// specifically set this up before importing anything else so it's ready to start being populated
// game.modules.get(MODULE_NAME).api = {
//     config: {},
// };

import { HookWrapperHandler, localHooks } from './util/hooks.mjs';

import './handlebars-handlers/init.mjs';
import './util/item-hints.mjs';
import './bonuses.mjs';
import './patch/init.mjs';
import { FormulaCacheHelper } from './util/flag-helpers.mjs';
import { simplifyRollFormula } from './util/simplify-roll-formula.mjs';
import { debugSetup } from './util/if-debug.mjs';

import './overrides/action-damage.mjs';

/**
 * @param {() => any} wrapped
 * @this {ChatAttack}
*/
function setAttackNotesHTMLWrapper(wrapped) {
    Hooks.call(localHooks.chatAttackAttackNotes, this);
    return wrapped();
}

/**
 * @param {() => any} wrapped
 * @this {ChatAttack}
 */
function setEffectNotesHTMLWrapper(wrapped) {
    Hooks.call(localHooks.chatAttackEffectNotes, this);
    return wrapped();
}

/**
 * @param {() => number | string} wrapped
 * @this ItemChange
 */
function patchChangeValue(wrapped) {
    const seed = wrapped();
    const value = HookWrapperHandler.fireHookWithReturnSync(localHooks.patchChangeValue, seed, this);
    return value;
}

/**
 * @param {*} wrapped
 * @param {*} options
 * @this {d20Roll}
 * @returns The result of the original method.
 */
function d20RollWrapper(wrapped, options = {}) {
    Hooks.call(localHooks.d20Roll, options);
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
    HookWrapperHandler.fireHookNoReturnSync(localHooks.prepareData, item, rollData);
}

/**
 * @param {*} wrapped - original method
 * @param {*} options - options passed to ItemPF.use
 * @this {ItemPF}
 * @returns The result of the original method.
 */
function itemUseWrapper(wrapped, options = {}) {
    Hooks.call(localHooks.itemUse, this, options);
    return wrapped.call(this, options);
}

/**
 * @param {(arg: object) => any} wrapped
 * @param {object} e - The attack dialog's JQuery form data or FormData object
 * @this ActionUse
 */
function actionUseAlterRollData(wrapped, e) {
    wrapped(e);
    Hooks.call(localHooks.actionUseAlterRollData, this);
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
    Hooks.call(localHooks.getConditionalParts, this, result, atk, index);
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
    Hooks.call(localHooks.actionUseHandleConditionals, this);
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
    Hooks.call(localHooks.itemGetAttackSources, this, sources);
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
    Hooks.call(localHooks.itemGetTypeChatData, this, props, rollData);
}

/**
 * Get damage sources for actor's combat tooltips
 * @param {() => any} wrapped
 * @this {ItemAction}
 */
function actionDamageSources(wrapped) {
    const sources = wrapped();
    Hooks.call(localHooks.actionDamageSources, this, sources);
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

Hooks.once('setup', () => {
    debugSetup();
});

Hooks.once('init', () => {
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ActionUse.prototype._getConditionalParts', getConditionalParts, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ActionUse.prototype.alterRollData', actionUseAlterRollData, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ActionUse.prototype.handleConditionals', actionUseHandleConditionals, libWrapper.WRAPPER);
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
});
