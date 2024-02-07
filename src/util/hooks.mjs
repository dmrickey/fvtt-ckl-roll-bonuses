import { MODULE_NAME } from "../consts.mjs";

export const localHooks = /** @type {const} */ ({
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
    patchChangeValue: `${MODULE_NAME}_patchChangeValue`,

    /** @deprecated Do not use - makes multi attacks way too chatty */
    chatAttackEffectNotes: `${MODULE_NAME}_chatAttackEffectNotes`,
});

/**
 * @typedef {(typeof localHooks)[keyof typeof localHooks]} Hook
 */

/** @type {{[key in Hook]?: any[]}} */
const handlers = {};

export class HookWrapperHandler {

    /**
     * @overload
     * @param {typeof localHooks.patchChangeValue} hook
     * @param {(value: number | string, itemChange: ItemChange) => number | string} func
     * @returns {void}v
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
    static handleHookSync(hook, seed, ...args) {
        const funcs = handlers[hook] || [];

        let value = seed;

        for (let i = 0; i < funcs.length; i++) {
            const func = funcs[i];
            value = func(value, ...args);
        }

        return value;
    }
}
