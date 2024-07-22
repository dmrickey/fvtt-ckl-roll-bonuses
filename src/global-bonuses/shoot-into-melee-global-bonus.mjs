import { Distance } from '../util/distance.mjs';
import { hasAnyBFlag } from '../util/flag-helpers.mjs';
import { currentTargets } from '../util/get-current-targets.mjs';
import { customGlobalHooks } from '../util/hooks.mjs'
import { BaseGlobalBonus } from './.base-global-bonus.mjs';
import * as PreciseShot from './targeted/bonuses/precise-shot-bonus.mjs';

/** @type {ActionType[]} */
const rangedTypes = ['rwak', 'rcman', 'rsak', 'twak'];

/** @extends {BaseGlobalBonus} */
export class ShootIntoMeleeGlobalBonus extends BaseGlobalBonus {
    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get bonusKey() { return 'higher-ground'; }

    /**
     * @inheritdoc
     * @override
     */
    static registerBonuses() {
        PreciseShot.init();
    }

    /**
     * @param {ActionUse} actionUse
     */
    static addPenalty(actionUse) {
        const { action, actor, item, shared } = actionUse;
        if (this.isDisabled() || this.isDisabledForActor(actor)) {
            return;
        }
        if (!(
            item instanceof pf1.documents.item.ItemWeaponPF
            || item instanceof pf1.documents.item.ItemAttackPF
            || item instanceof pf1.documents.item.ItemSpellPF
        )) {
            return;
        }
        if (!actor || hasAnyBFlag(actor, PreciseShot.key)) {
            return;
        }

        const isRanged = rangedTypes.includes(action.data.actionType);
        if (!isRanged) {
            return;
        }

        const actorToken = actionUse.token || actor.getActiveTokens()[0];
        const targets = currentTargets();

        if (!actorToken || !targets.length) {
            return;
        }

        const isEngagedInMelee = targets.every((target) => {
            const d = new Distance(actorToken, target);
            return d.isEngagedInMelee();
        });

        if (isEngagedInMelee) {
            shared.attackBonus.push(`-4[${this.label}]`);
        }
    }

    static {
        Hooks.on(customGlobalHooks.actionUseAlterRollData, ShootIntoMeleeGlobalBonus.addPenalty);
    }
}
