import { PositionalHelper } from '../util/positional-helper.mjs';
import { currentTargets } from '../util/get-current-targets.mjs';
import { customGlobalHooks } from '../util/hooks.mjs'
import { BaseGlobalBonus } from './base-global-bonus.mjs';

/** @extends {BaseGlobalBonus} */
export class HigherGroundGlobalBonus extends BaseGlobalBonus {
    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get bonusKey() { return 'higher-ground'; }

    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.4A4bCh8VsQVbTsAY#higher-ground-bonus'; }

    /**
     * @param {ActionUse} actionUse
     */
    static addHigherGroundBonus(actionUse) {
        const { action, actor, shared } = actionUse;
        if (!actor) {
            return;
        }

        if (HigherGroundGlobalBonus.isDisabled() || HigherGroundGlobalBonus.isDisabledForActor(actor)) {
            return;
        }

        const isMelee = ['mcman', 'mwak', 'msak'].includes(action.actionType);
        if (!isMelee) {
            return;
        }

        const actorToken = actionUse.token || actor.getActiveTokens()[0];
        const targets = currentTargets();

        if (!actorToken || !targets.length) {
            return;
        }

        const isHigher = targets.every((target) => {
            const d = new PositionalHelper(actorToken, target);
            return d.threatens(actionUse.action) && d.isOnHigherGround();
        });

        if (isHigher) {
            shared.attackBonus.push(`1[${HigherGroundGlobalBonus.attackLabel}]`);
        }
    }

    static {
        Hooks.on(customGlobalHooks.actionUseAlterRollData, HigherGroundGlobalBonus.addHigherGroundBonus);
    }
}
