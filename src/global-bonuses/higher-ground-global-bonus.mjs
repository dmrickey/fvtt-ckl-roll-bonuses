import { Distance } from '../util/distance.mjs';
import { currentTargets } from '../util/get-current-targets.mjs';
import { customGlobalHooks } from '../util/hooks.mjs'
import { BaseGlobalBonus } from './.base-global-bonus.mjs';

/** @extends {BaseGlobalBonus} */
export class HigherGroundGlobalBonus extends BaseGlobalBonus {
    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get bonusKey() { return 'higher-ground'; }

    /**
     * @param {ActionUse} actionUse
     */
    static addHigherGroundBonus(actionUse) {
        const { action, actor, item, shared } = actionUse;
        if (this.isDisabled() || this.isDisabledForActor(actor)) {
            return;
        }
        if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)) {
            return;
        }
        if (!actor) {
            return;
        }

        const isMelee = ['mcman', 'mwak', 'msak'].includes(action.data.actionType);
        if (!isMelee) {
            return;
        }

        const actorToken = actionUse.token || actor.getActiveTokens()[0];
        const targets = currentTargets();

        if (!actorToken || !targets.length) {
            return;
        }

        const isHigher = targets.every((target) => {
            const d = new Distance(actorToken, target);
            return d.isOnHigherGround();
        });

        if (isHigher) {
            shared.attackBonus.push(`1[${this.label}]`);
        }
    }

    static {
        Hooks.on(customGlobalHooks.actionUseAlterRollData, HigherGroundGlobalBonus.addHigherGroundBonus);
    }
}
