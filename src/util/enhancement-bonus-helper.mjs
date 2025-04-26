import { ammoBaneCreatureSubtype, ammoBaneCreatureType, ammoEnhancementKey, ammoEnhancementStacksKey } from '../bonuses/ammunition-shared-keys.mjs';
import { MODULE_NAME } from '../consts.mjs';
import { api } from './api.mjs';
import { intersects } from './array-intersects.mjs';
import { FormulaCacheHelper } from './flag-helpers.mjs';
import { getIdsFromItem } from './get-id-array-from-flag.mjs';

/**
 * @typedef {{base?: number, stacks?: number, hasBane: boolean}} EnhDataArgs
 */

class EnhData {
    /**
     * @param {EnhDataArgs} param0
     */
    constructor({ base = 0, stacks = 0, hasBane }) {
        this.base = base;
        this.hasBane = hasBane;
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
 * @param {TokenPF[]} [args.targets]
 * @returns {EnhBonusResult}
 */
const getEnhancementBonusForAction = ({ action, ammo, targets }) => {
    const enhData = new EnhBonusResult();

    if (action) {
        if (!(action instanceof pf1.components.ItemAction)) {
            console.error(`"action" is not an "ItemAction"`, action);
        }

        let { base, stacks } = action[MODULE_NAME]?.enhancement ?? {};
        base ||= 0;
        stacks ||= 0;
        const hasBane = !!api.bonusTypeMap['bonus_bane'].actionHasBaneTarget(action);
        enhData.action = new EnhData({ base, hasBane, stacks });
    }

    if (ammo) {
        if (!(ammo instanceof pf1.documents.item.ItemLootPF && ammo.subType === 'ammo')) {
            console.error('"ammo" is not ammunition', ammo);
        }

        const base = FormulaCacheHelper.getModuleFlagValue(ammo, ammoEnhancementKey);
        let stacks = FormulaCacheHelper.getModuleFlagValue(ammo, ammoEnhancementStacksKey);

        let hasBane = false;
        if (targets?.length && !enhData.action?.hasBane) {
            const creatureTypes = getIdsFromItem(ammo, ammoBaneCreatureType);
            const creatureSubtypes = getIdsFromItem(ammo, ammoBaneCreatureSubtype);

            if (creatureTypes.length || creatureSubtypes.length) {
                hasBane = targets.map(x => x.actor).every((a) =>
                    (!creatureTypes.length || intersects(creatureTypes, a?.race?.system.creatureTypes.total))
                    && (!creatureSubtypes.length || intersects(creatureSubtypes, a?.race?.system.creatureSubtypes.total))
                );

                if (hasBane) {
                    stacks += 2;
                }
            }
        }

        enhData.ammo = new EnhData({ base, hasBane, stacks });
    }

    return enhData;
}

api.utils.getEnhancementBonusForAction = getEnhancementBonusForAction;

export {
    getEnhancementBonusForAction,
};
