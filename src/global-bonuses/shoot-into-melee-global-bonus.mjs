import { isRanged } from '../util/action-type-helpers.mjs';
import { currentTargets } from '../util/get-current-targets.mjs';
import { customGlobalHooks } from '../util/hooks.mjs';
import { PositionalHelper } from '../util/positional-helper.mjs';
import { BaseGlobalBonus } from './base-global-bonus.mjs';
import { PreciseShot } from './specific/bonuses/precise-shot-bonus.mjs';

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
        PreciseShot.register();
    }

    /**
     * @param {ActionUse} actionUse
     */
    static addPenalty(actionUse) {
        const { action, actor, shared } = actionUse;
        if (this.isDisabled() || this.isDisabledForActor(actor)) {
            return;
        }
        if (!actor || PreciseShot.has(actor)) {
            return;
        }

        if (!isRanged(action.item, action)) {
            return;
        }

        const actorToken = actionUse.token || actor.getActiveTokens()[0];
        const targets = currentTargets();

        if (!actorToken || !targets.length) {
            return;
        }

        const penalties = targets.map((target) => {
            const helper = new PositionalHelper(actorToken, target);
            return helper.getShootingIntoMeleePenalty();
        });

        const penalty = Math.max(...penalties);
        if (penalty) {
            shared.attackBonus.push(`-${penalty}[${this.attackLabel}]`);
        }
    }

    static {
        Hooks.on(customGlobalHooks.actionUseAlterRollData, this.addPenalty.bind(this));
    }
}
