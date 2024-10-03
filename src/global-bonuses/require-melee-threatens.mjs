import { PositionalHelper } from '../util/positional-helper.mjs';
import { currentTargets } from '../util/get-current-targets.mjs';
import { customGlobalHooks } from '../util/hooks.mjs'
import { BaseGlobalBonus } from './base-global-bonus.mjs';
import { addCheckToAttackDialog, hasFormData } from '../util/attack-dialog-helper.mjs';

/** @extends {BaseGlobalBonus} */
export class RequireMeleeThreatenGlobalBonus extends BaseGlobalBonus {
    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get bonusKey() { return 'require-melee-threaten'; }

    /**
     * @this {ActionUse}
     * @param {AttackDialog} dialog
     * @param {[HTMLElement]} html
     * @param {AttackDialogData} data
     */
    static addSkipMeleeThreatenToDialog(dialog, [html], data) {
        if (!(dialog instanceof pf1.applications.AttackDialog)) {
            return;
        }
        if (RequireMeleeThreatenGlobalBonus.isDisabled() || RequireMeleeThreatenGlobalBonus.isDisabledForActor(data.item?.actor)) {
            return;
        }

        const isMelee = ['mcman', 'mwak', 'msak'].includes(data.action.data.actionType);
        if (!isMelee) {
            return;
        }

        addCheckToAttackDialog(
            html,
            RequireMeleeThreatenGlobalBonus.dialogDisableKey,
            dialog,
        );
    }

    /**
     * @param {ActionUse} actionUse
     */
    static requireMelee(actionUse) {
        const { action, actor, shared } = actionUse;
        if (RequireMeleeThreatenGlobalBonus.isDisabled() || RequireMeleeThreatenGlobalBonus.isDisabledForActor(actor)) {
            return;
        }
        if (hasFormData(actionUse, RequireMeleeThreatenGlobalBonus.dialogDisableKey)) {
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

    /**
     * @param {ActionUse} actionUse
     * @param {string[]} notes
     */
    static addSkipFootnote(actionUse, notes) {
        if (hasFormData(actionUse, RequireMeleeThreatenGlobalBonus.dialogDisableKey)) {
            notes.push(RequireMeleeThreatenGlobalBonus.disabledFootnote);
        }
    }

    static {
        Hooks.on('renderApplication', RequireMeleeThreatenGlobalBonus.addSkipMeleeThreatenToDialog);
        Hooks.on(customGlobalHooks.actionUseAlterRollData, RequireMeleeThreatenGlobalBonus.requireMelee);
        Hooks.on(customGlobalHooks.actionUseFootnotes, RequireMeleeThreatenGlobalBonus.addSkipFootnote)
    }
}
