import { ammoEnhancementKey, ammoEnhancementStacksKey } from '../bonuses/ammunition-shared-keys.mjs';
import { MODULE_NAME } from '../consts.mjs';
import { api } from './api.mjs';
import { FormulaCacheHelper } from './flag-helpers.mjs';

/**
 * @param {ItemAction} action
 * @param {ItemLootPF} [ammo]
 * @returns {{ base: number, stacks: number, total: number }} increases
 */
const getEnhancementBonusForAction = (action, ammo) => {
    let { base, stacks } = action[MODULE_NAME]?.enhancement ?? {};
    base ||= 0;
    stacks ||= 0;

    if (ammo instanceof pf1.documents.item.ItemLootPF && ammo.subType === 'ammo') {
        const ammoEnhBonus = FormulaCacheHelper.getModuleFlagValue(ammo, ammoEnhancementKey);
        const ammoEnhStacksBonus = FormulaCacheHelper.getModuleFlagValue(ammo, ammoEnhancementStacksKey);

        base = Math.max(base, ammoEnhBonus);
        stacks += ammoEnhStacksBonus;
    }

    const total = base + stacks;

    return { base, stacks, total };
}

api.utils.getEnhancementBonusForAction = getEnhancementBonusForAction;

export {
    getEnhancementBonusForAction,
};
