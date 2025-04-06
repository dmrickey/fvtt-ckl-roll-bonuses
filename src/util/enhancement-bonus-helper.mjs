import { ammoEnhancementKey, ammoEnhancementStacksKey } from '../bonuses/ammunition-shared-keys.mjs';
import { MODULE_NAME } from '../consts.mjs';
import { api } from './api.mjs';
import { FormulaCacheHelper } from './flag-helpers.mjs';

class EnhData {
    constructor({ base = 0, stacks = 0 }) {
        this.base = base;
        this.stacks = stacks;
    }
    get total() { return (this.base || 0) + (this.stacks || 0); }
}

class EnhBonusResult {
    /** @type {EnhData?} */
    ammo = null;

    /** @type {EnhData?} */
    action = null;

    get base() {
        return Math.max(this.ammo?.base || 0, this.action?.base || 0);
    }

    get stacks() {
        return (this.ammo?.stacks || 0) + (this.action?.stacks || 0);
    }

    get total() {
        return this.base + this.stacks
    }
}

/**
 * @param {object} args
 * @param {ItemAction} [args.action]
 * @param {ItemLootPF} [args.ammo]
 * @returns {EnhBonusResult}
 */
const getEnhancementBonusForAction = ({ action, ammo }) => {
    const enhData = new EnhBonusResult();

    if (action) {
        if (!(action instanceof pf1.components.ItemAction)) {
            console.error(`"action" is not an "ItemAction"`, action);
        }

        let { base, stacks } = action[MODULE_NAME]?.enhancement ?? {};
        base ||= 0;
        stacks ||= 0;
        enhData.action = new EnhData({ base, stacks });
    }

    if (ammo) {
        if (!(ammo instanceof pf1.documents.item.ItemLootPF && ammo.subType === 'ammo')) {
            console.error('"ammo" is not ammunition', ammo);
        }

        const base = FormulaCacheHelper.getModuleFlagValue(ammo, ammoEnhancementKey);
        const stacks = FormulaCacheHelper.getModuleFlagValue(ammo, ammoEnhancementStacksKey);

        enhData.ammo = new EnhData({ base, stacks });
    }

    return enhData;
}

api.utils.getEnhancementBonusForAction = getEnhancementBonusForAction;

export {
    getEnhancementBonusForAction,
};
