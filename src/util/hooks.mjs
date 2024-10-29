import { MODULE_NAME } from "../consts.mjs";

export const customGlobalHooks = /** @type {const} */ ({
    getDamageTooltipSources: `${MODULE_NAME}_getDamageTooltipSources`,
    actionUseAlterRollData: `${MODULE_NAME}_actionUseAlterRollData`,
    actionUseHandleConditionals: `${MODULE_NAME}_actionUseHandleConditionals`,
    actionUseFootnotes: `${MODULE_NAME}_actionUseFootnotes`,
    d20Roll: `${MODULE_NAME}_d20Roll`,
    getActorInitiativeFormula: `${MODULE_NAME}_getActorInitiativeFormula`,
    getConditionalParts: `${MODULE_NAME}_getConditionalParts`,
    itemGetAttackSources: `${MODULE_NAME}_itemGetAttackSources`,
    itemGetTypeChatData: `${MODULE_NAME}_itemGetTypeChatData`,
});

export const localHooks = /** @type {const} */ ({
    actionUseProcess: `${MODULE_NAME}_actionUseProcess`,
    actorGetSkillInfo: `${MODULE_NAME}_actorGetSkillInfo`,
    actorRollSkill: `${MODULE_NAME}_actorRollSkill`,
    cacheBonusTypeOnActor: `${MODULE_NAME}_cacheBonusTypeOnActor`,
    chatAttackAddAttack: `${MODULE_NAME}_chatAttackAddAttack`,
    preRollChatAttackAddAttack: `${MODULE_NAME}_preRollChatAttackAddAttack`,
    chatAttackEffectNotes: `${MODULE_NAME}_chatAttackEffectNotes`,
    initItemActionRollData: `${MODULE_NAME}_initItemActionRollData`,
    itemActionCritRangeWrapper: `${MODULE_NAME}_itemActionCritRangeWrapper`,
    itemActionEnhancementBonus: `${MODULE_NAME}_itemActionEnhancementBonus`,
    itemActionRollAttack: `${MODULE_NAME}_itemActionRollAttack`,
    itemActionRollDamage: `${MODULE_NAME}_itemActionRollDamage`,
    itemPF_prepareScriptCalls: `${MODULE_NAME}_itemPF_prepareScriptCalls`,
    modifyActionLabelDC: `${MODULE_NAME}_modifyActionLabelDC`,
    patchChangeValue: `${MODULE_NAME}_patchChangeValue`,
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
     * @param {typeof localHooks.itemActionEnhancementBonus} hook
     * @param {(seed: {base: number, stacks: number }, action: ItemAction) => void} func
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.actionUseProcess} hook
     * @param {(actionUse: ActionUse) => void} func
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.actorGetSkillInfo} hook
     * @param {(skillInfo: SkillInfo, actor: ActorPF, rollData: RollData) => void} func
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.actorRollSkill} hook
     * @param {(seed: { skillId: keyof typeof pf1.config.skills, options: object }, actor: ActorPF) => void} func
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.chatAttackAddAttack} hook
     * @param {(chatAttack: ChatAttack,  args: { noAttack: boolean, bonus: unknown, extraParts: string[], critical: boolean, conditionalParts: object }) => Promise<void>} func
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.preRollChatAttackAddAttack} hook
     * @param {(chatAttack: ChatAttack,  args: { noAttack: boolean, bonus: unknown, extraParts: string[], critical: boolean, conditionalParts: object }) => Promise<void>} func
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.chatAttackEffectNotes} hook
     * @param {(chatAttack: ChatAttack) => Promise<void>} func
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.initItemActionRollData} hook
     * @param {(action: ItemAction, rollData: RollData) => void} func
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
     * @param {(value: number | string, type: BonusTypes, actor: Nullable<ActorPF>) => number | string} func
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.cacheBonusTypeOnActor} hook
     * @param {(item: ItemPF) => void} func
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
     * @param {(seed: ItemActionRollAttackHookArgs, action: ItemAction, data: RollData) => void} func
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.itemActionRollDamage} hook
     * @param {(seed: ItemActionRollAttackHookArgs, action: ItemAction, data: RollData, index: number) => void} func
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.modifyActionLabelDC} hook
     * @param {(action: ItemAction, seed: {dc: number}) => void} func
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.itemPF_prepareScriptCalls} hook
     * @param {(item: ItemPF) => void} func
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
     * @overload
     * @param {typeof localHooks.itemActionEnhancementBonus} hook
     * @param {{base: number, stacks: number }} seed
     * @param {ItemAction} action
     * @returns {void}
     */

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
     * @param {BonusTypes} type
     * @param {Nullable<ActorPF>} actor
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
     * @param {typeof localHooks.chatAttackEffectNotes} hook
     * @param {ChatAttack} chatAttack
     * @returns {Promise<void>}
     */

    /**
     * @overload
     * @param {typeof localHooks.preRollChatAttackAddAttack} hook
     * @param {ChatAttack} chatAttack
     * @param {{ noAttack: boolean, bonus: unknown, extraParts: string[], critical: boolean, conditionalParts: object }} args
     * @returns {Promise<void>}
     */

    /**
     * @overload
     * @param {typeof localHooks.chatAttackAddAttack} hook
     * @param {ChatAttack} chatAttack
     * @param {{ noAttack: boolean, bonus: unknown, extraParts: string[], critical: boolean, conditionalParts: object }} args
     * @returns {Promise<void>}
     */

    /**
     * @param {Hook} hook
     * @param {...any} args
     * @returns {Promise<void>}
     */
    static async fireHookNoReturnAsync(hook, ...args) {
        const funcs = handlers[hook] || [];

        for (const func of funcs) {
            await func(...args);
        }
    }

    /**
     * @overload
     * @param {typeof localHooks.actionUseProcess} hook
     * @param {ActionUse} action
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.actorGetSkillInfo} hook
     * @param {SkillInfo} skillInfo
     * @param {ActorPF} actor
     * @param {RollData} rollData
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.actorRollSkill} hook
     * @param {{ skillId: keyof typeof pf1.config.skills, options: object }} seed
     * @param {ActorPF} actor
     * @returns {void}
     */

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
     * @param {number} index
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.initItemActionRollData} hook
     * @param {ItemAction} action
     * @param {RollData} rollData
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
     * @param {typeof localHooks.cacheBonusTypeOnActor} hook
     * @param {ItemPF} item
     * @returns {void}
     */

    /**
     * @overload
     * @param {typeof localHooks.modifyActionLabelDC} hook
     * @param {ItemAction} action
     * @param {{ dc: number}} seed
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
     * @overload
     * @param {typeof localHooks.itemPF_prepareScriptCalls} hook
     * @param {ItemPF} item
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
