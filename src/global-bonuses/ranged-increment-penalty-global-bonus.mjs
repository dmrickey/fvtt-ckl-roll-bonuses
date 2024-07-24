import { Sources } from '../targeted/source-registration.mjs';
import { PositionalHelper } from '../util/positional-helper.mjs';
import { currentTargets } from '../util/get-current-targets.mjs';
import { customGlobalHooks } from '../util/hooks.mjs'
import { BaseGlobalBonus } from './base-global-bonus.mjs';
import { RangedIncrementPenaltyBonus } from './targeted/bonuses/ranged-increment-penalty-bonus.mjs';

/** @extends {BaseGlobalBonus} */
export class RangedIncrementPenaltyGlobalBonus extends BaseGlobalBonus {
    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get bonusKey() { return 'range-increment-penalty'; }

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

        const isRangedAttack = ['rcman', 'rwak', 'twak'].includes(action.data.actionType);
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
            penalty: 2,
            penaltyOffset: 0,
            range,
        };
    }

    /**
     * @inheritdoc
     * @override
     */
    static registerBonuses() {
        Sources.registerSource(RangedIncrementPenaltyBonus);
        RangedIncrementPenaltyBonus.init();
    }

    /**
     * @param {ActionUse} actionUse
     */
    static addRangedPenalty(actionUse) {
        const { actor, shared } = actionUse;
        if (RangedIncrementPenaltyGlobalBonus.isDisabled() || RangedIncrementPenaltyGlobalBonus.isDisabledForActor(actor)) {
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

        const { maxIncrements, penalty, penaltyOffset, range } = rangePenalty;

        let distance = 0;
        targets.forEach((target) => {
            const d = new PositionalHelper(actorToken, target);
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
            ui.notifications.warn(RangedIncrementPenaltyGlobalBonus._warning(message, args));
            return;
        }

        const total = -(penalty * (steps - 1) + penaltyOffset);
        if (total < 0) {
            const args = { range: distance, units: actionUse.action.data.range.units };
            shared.attackBonus.push(`${total}[${RangedIncrementPenaltyGlobalBonus._attackLabel(RangedIncrementPenaltyGlobalBonus.bonusKey, args)}]`);
        }
    }

    static {
        Hooks.on(customGlobalHooks.actionUseAlterRollData, RangedIncrementPenaltyGlobalBonus.addRangedPenalty);
    }
}
