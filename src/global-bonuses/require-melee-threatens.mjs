import { PositionalHelper } from '../util/positional-helper.mjs';
import { currentTargets } from '../util/get-current-targets.mjs';
import { customGlobalHooks } from '../util/hooks.mjs'
import { BaseGlobalBonus } from './base-global-bonus.mjs';

/** @extends {BaseGlobalBonus} */
export class RequireMeleeThreatenGlobalBonus extends BaseGlobalBonus {
    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get bonusKey() { return 'require-melee-threaten'; }

    /**
     * @param {ActionUse} actionUse
     */
    static addHigherGroundBonus(actionUse) {
        const { action, actor, shared } = actionUse;
        if (RequireMeleeThreatenGlobalBonus.isDisabled() || RequireMeleeThreatenGlobalBonus.isDisabledForActor(actor)) {
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

        const isInRange = targets.every((target) => {
            const d = new PositionalHelper(actorToken, target);
            return d.threatens(actionUse.action);
        });

        if (!isInRange) {
            const key = targets.length > 1
                ? RequireMeleeThreatenGlobalBonus.bonusKey + '-plural'
                : RequireMeleeThreatenGlobalBonus.bonusKey + '-singular';
            const message = RequireMeleeThreatenGlobalBonus._warning(key);
            ui.notifications.warn(message);
            shared.reject = true;
        }
    }

    static {
        Hooks.on(customGlobalHooks.actionUseAlterRollData, RequireMeleeThreatenGlobalBonus.addHigherGroundBonus);
    }
}
