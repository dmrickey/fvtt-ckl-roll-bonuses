import { MODULE_NAME } from "../consts.mjs";

export const customGlobalHooks = /** @type {const} */ ({
    actionDamageSources: `${MODULE_NAME}_actionDamageSources`,
    actionUseAlterRollData: `${MODULE_NAME}_actionUseAlterRollData`,
    actionUseHandleConditionals: `${MODULE_NAME}_actionUseHandleConditionals`,
    /** Make sure to put the effect note on the specific attack effected and not all */
    chatAttackEffectNotes: `${MODULE_NAME}_chatAttackEffectNotes`,
    chatAttackFootnotes: `${MODULE_NAME}_chatAttackFootnotes`,
    d20Roll: `${MODULE_NAME}_d20Roll`,
    getActorInitiativeFormula: `${MODULE_NAME}_getActorInitiativeFormula`,
    getConditionalParts: `${MODULE_NAME}_getConditionalParts`,
    itemGetAttackSources: `${MODULE_NAME}_itemGetAttackSources`,
    itemGetTypeChatData: `${MODULE_NAME}_itemGetTypeChatData`,
    itemUse: `${MODULE_NAME}_itemUse`,
});

export const localHooks = /** @type {const} */ ({
    itemActionCritRangeWrapper: `${MODULE_NAME}_itemActionCritRangeWrapper`,
    itemActionRollAttack: `${MODULE_NAME}_itemActionRollAttack`,
    itemActionRollDamage: `${MODULE_NAME}_itemActionRollDamage`,
    patchChangeValue: `${MODULE_NAME}_patchChangeValue`,
    postPrepareActorDerivedData: `${MODULE_NAME}_postPrepareActorDerivedData`,
    prepareData: `${MODULE_NAME}_prepareData`,
    updateItemActionRollData: `${MODULE_NAME}_updateItemActionRollData`,
});

/**
 * @typedef {(typeof localHooks)[keyof typeof localHooks]} Hook
 */

/** @type {{[key in Hook]?: any[]}} */
const handlers = {};

export class LocalHookHandler {

    /**
     * @overload
     * @param {typeof localHooks.postPrepareActorDerivedData} hook
     * @param {(actor: ActorPF) => void} func
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.updateItemActionRollData} hook
     * @param {(action: ItemAction, rollData: RollData) => void} func
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.itemActionCritRangeWrapper} hook
     * @param {(value: number, action: ItemAction) => number} func
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.patchChangeValue} hook
     * @param {(value: number | string, itemChange: ItemChange) => number | string} func
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.prepareData} hook
     * @param {(item: ItemPF, rollData: RollData) => void} func
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.itemActionRollAttack} hook
     * @param {(seed: ItemActionRollAttackHookArgs, action: ItemAction, data: RollData) => Promise<ItemActionRollAttackHookArgs>} func
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.itemActionRollDamage} hook
     * @param {(seed: ItemActionRollAttackHookArgs, action: ItemAction, data: RollData) => Promise<ItemActionRollAttackHookArgs>} func
     * @returns {void}
     */

    /**
     * @param {Hook} hook
     * @param {*} func
     * @returns {void}
     */
    static registerHandler(hook, func) {
        handlers[hook] ||= [];
        handlers[hook]?.push(func);
    }

    /**
     * @param {Hook} hook
     * @template T
     * @param {T} seed
     * @param {...any} args
     * @returns {Promise<T>}
     */
    static async handleHookAsync(hook, seed, ...args) {
        const funcs = handlers[hook] || [];

        let value = seed;

        for (const func of funcs) {
            value = await func(value, ...args);
        }

        return value;
    }

    /**
     * @overload
     * @param {typeof localHooks.itemActionCritRangeWrapper} hook
     * @param {number | string} seed
     * @param {ItemAction} action
     * @returns {number}
     */

    /**
     * @overload
     * @param {typeof localHooks.patchChangeValue} hook
     * @param {number | string} seed
     * @param {ItemChange} itemChange
     * @returns {number | string}
     */

    /**
     * @param {Hook} hook
     * @template T
     * @param {T} seed
     * @param {...any} args
     * @returns {T}
     */
    static fireHookWithReturnSync(hook, seed, ...args) {
        const funcs = handlers[hook] || [];

        let value = seed;

        for (const func of funcs) {
            value = func(value, ...args);
        }

        return value;
    }

    /**
     * @overload
     * @param {typeof localHooks.itemActionRollAttack} hook
     * @param {ItemActionRollAttackHookArgs} seed
     * @param {ItemAction} action
     * @param {RollData} data
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.itemActionRollDamage} hook
     * @param {ItemActionRollAttackHookArgs} seed
     * @param {ItemAction} action
     * @param {RollData} data
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.postPrepareActorDerivedData} hook
     * @param {ActorPF} actor
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.updateItemActionRollData} hook
     * @param {ItemAction} action
     * @param {RollData} rollData
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.prepareData} hook
     * @param {ItemPF} item
     * @param {RollData} rollData
     * @returns {void}
     */

    /**
     * @param {Hook} hook
     * @param {...any} args
     * @returns {void}
     */
    static fireHookNoReturnSync(hook, ...args) {
        const funcs = handlers[hook] || [];

        for (const func of funcs) {
            func(...args);
        }
    }
}
