import { Distance } from '../util/distance.mjs';
import { currentTargets } from '../util/get-current-targets.mjs';
import { customGlobalHooks } from '../util/hooks.mjs'
import { localize } from '../util/localize.mjs';
import { BaseGlobalBonus } from './base-global-bonus.mjs';

/** @extends {BaseGlobalBonus} */
export class RangedIncrementPenalty extends BaseGlobalBonus {
    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get key() { return 'range-increment-penalty'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemAction} action
     * @param {RollData} rollData
     */
    static initRollData(action, rollData) {
        if (rollData.rb.rangePenalty !== undefined) {
            return;
        }

        const isRangedAttack = ['rcman', 'rwak', 'rsak', 'twak'].includes(action.data.actionType);
        if (!isRangedAttack) {
            return;
        }

        if (!['ft', 'm'].includes(rollData.action?.range?.units || '')) {
            return;
        }

        const range = RollPF.safeTotal(rollData.action?.range?.value ?? '0');
        if (!range) {
            return;
        }

        const maxIncrements = rollData.action?.range?.maxIncrements ?? Number.POSITIVE_INFINITY;
        if (!maxIncrements) {
            return;
        }

        rollData.rb.rangePenalty = {
            maxIncrements,
            range,
            penalty: 2,
        };
    }

    static {
        /**
         * @param {ActionUse} actionUse
         */
        function addRangedPenalty(actionUse) {
            const { actor, item, shared } = actionUse;
            if (RangedIncrementPenalty.isDisabled() || RangedIncrementPenalty.isDisabledForActor(actor)) {
                return;
            }
            if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)) {
                return;
            }
            if (!actor || !shared?.rollData?.rb) {
                return;
            }

            const { rangePenalty } = shared.rollData.rb;
            if (!rangePenalty) {
                return;
            }

            const actorToken = actionUse.token || actor.getActiveTokens()[0];
            const targets = currentTargets();

            if (!actorToken || !targets.length) {
                return;
            }

            const { maxIncrements, range, penalty } = rangePenalty;

            let distance = 0;
            targets.forEach((target) => {
                const d = new Distance(actorToken, target);
                distance = Math.max(distance, d.distance());
            });

            const steps = Math.ceil(distance / range);

            if (steps > maxIncrements) {
                shared.reject = true;
                const message = targets.length > 1
                    ? 'range-increment-error-plural'
                    : 'range-increment-error-singular';
                const args = {
                    distance,
                    max: maxIncrements * range,
                    units: actionUse.action.data.range.units
                };
                ui.notifications.warn(localize(message, args));
                return;
            }

            const total = -penalty * (steps - 1);
            if (total) {
                const args = { range: distance, units: actionUse.action.data.range.units };
                shared.attackBonus.push(`${total}[${localize('ranged-attack-penalty', args)}]`);
            }
        }
        Hooks.on(customGlobalHooks.actionUseAlterRollData, addRangedPenalty);
    }
}