import { MODULE_NAME } from "../consts.mjs";

export const localHooks = {
    actionDamageSources: `${MODULE_NAME}_actionDamageSources`,
    actionUseAlterRollData: `${MODULE_NAME}_actionUseAlterRollData`,
    chatAttackAttackNotes: `${MODULE_NAME}_chatAttackAttackNotes`,
    d20Roll: `${MODULE_NAME}_d20Roll`,
    getActorInitiativeFormula: `${MODULE_NAME}_getActorInitiativeFormula`,
    itemGetAttackSources: `${MODULE_NAME}_itemGetAttackSources`,
    itemGetTypeChatData: `${MODULE_NAME}_itemGetTypeChatData`,
    itemUse: `${MODULE_NAME}_itemUse`,

    /** @deprecated Do not use - makes multi attacks way too chatty */
    chatAttackEffectNotes: `${MODULE_NAME}_chatAttackEffectNotes`,
};
