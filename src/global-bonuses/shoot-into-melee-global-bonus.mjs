import { PositionalHelper } from '../util/positional-helper.mjs';
import { currentTargets } from '../util/get-current-targets.mjs';
import { customGlobalHooks } from '../util/hooks.mjs'
import { BaseGlobalBonus } from './base-global-bonus.mjs';
import * as PreciseShot from './specific/bonuses/precise-shot-bonus.mjs';

/** @type {ActionType[]} */
const rangedTypes = ['rwak', 'rcman', 'rsak', 'twak'];

/** @extends {BaseGlobalBonus} */
export class ShootIntoMeleeGlobalBonus extends BaseGlobalBonus {
    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get bonusKey() { return 'shoot-into-melee'; }

    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.4A4bCh8VsQVbTsAY#shooting-into-melee'; }

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
        const { action, actor, shared } = actionUse;
        if (ShootIntoMeleeGlobalBonus.isDisabled() || ShootIntoMeleeGlobalBonus.isDisabledForActor(actor)) {
            return;
        }
        if (!actor || actor.hasItemBooleanFlag(PreciseShot.key)) {
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

        const penalties = targets.map((target) => {
            const penalty = new PositionalHelper(actorToken, target);
            return penalty.getShootingIntoMeleePenalty();
        });

        const penalty = Math.max(...penalties);
        if (penalty) {
            shared.attackBonus.push(`-${penalty}[${ShootIntoMeleeGlobalBonus.attackLabel}]`);
        }
    }

    static {
        Hooks.on(customGlobalHooks.actionUseAlterRollData, ShootIntoMeleeGlobalBonus.addPenalty);
    }
}
