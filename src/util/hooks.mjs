import { MODULE_NAME } from "../consts.mjs";

export const customGlobalHooks = /** @type {const} */ ({
    actionDamageSources: `${MODULE_NAME}_actionDamageSources`,
    actionUseAlterRollData: `${MODULE_NAME}_actionUseAlterRollData`,
    actionUseHandleConditionals: `${MODULE_NAME}_actionUseHandleConditionals`,
    chatAttackAttackNotes: `${MODULE_NAME}_chatAttackAttackNotes`,
    d20Roll: `${MODULE_NAME}_d20Roll`,
    getActorInitiativeFormula: `${MODULE_NAME}_getActorInitiativeFormula`,
    getConditionalParts: `${MODULE_NAME}_getConditionalParts`,
    itemGetAttackSources: `${MODULE_NAME}_itemGetAttackSources`,
    itemGetTypeChatData: `${MODULE_NAME}_itemGetTypeChatData`,
    itemUse: `${MODULE_NAME}_itemUse`,

    /** @deprecated Do not use - makes multi attacks way too chatty */
    chatAttackEffectNotes: `${MODULE_NAME}_chatAttackEffectNotes`,
});

export const localHooks = /** @type {const} */ ({
    itemActionCritRangeWrapper: `${MODULE_NAME}_itemActionCritRangeWrapper`,
    patchChangeValue: `${MODULE_NAME}_patchChangeValue`,
    prepareData: `${MODULE_NAME}_prepareData`,
});

/**
 * @typedef {(typeof localHooks)[keyof typeof localHooks]} Hook
 */

/** @type {{[key in Hook]?: any[]}} */
const handlers = {};

export class LocalHookHandler {

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
     * @param {T} value
     * @param {...any} args
     * @returns {Promise<T>}
     */
    static async handleHookAsync(hook, value, ...args) {
        const funcs = handlers[hook] || [];

        for (let i = 0; i < funcs.length; i++) {
            const func = funcs[i];
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
