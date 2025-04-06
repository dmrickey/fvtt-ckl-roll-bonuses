import { Sources } from '../targeted/source-registration.mjs';
import { PositionalHelper } from '../util/positional-helper.mjs';
import { currentTargets } from '../util/get-current-targets.mjs';
import { customGlobalHooks, LocalHookHandler, localHooks } from '../util/hooks.mjs'
import { BaseGlobalBonus } from './base-global-bonus.mjs';
import { RangedIncrementPenaltyBonus } from './targeted/bonuses/ranged-increment-penalty-bonus.mjs';
import { addCheckToAttackDialog, getFormData } from '../util/attack-dialog-helper.mjs';

/** @type {ActionType[]} */
const rangedTypes = ['rcman', 'rwak', 'twak', 'rsak'];

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
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.4A4bCh8VsQVbTsAY#ranged-increment-penalty'; }

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

        const isRangedAttack = rangedTypes.includes(action.actionType);
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
     * @param {AttackDialog} dialog
     * @param {[HTMLElement]} html
     * @param {AttackDialogData} data
     */
    static addSkipRangeToDialog(dialog, [html], data) {
        if (!(dialog instanceof pf1.applications.AttackDialog)) {
            return;
        }
        if (RangedIncrementPenaltyGlobalBonus.isDisabled() || RangedIncrementPenaltyGlobalBonus.isDisabledForActor(data.item?.actor)) {
            return;
        }

        const { rangePenalty } = dialog.rollData.rb;
        if (!rangePenalty) {
            return;
        }

        addCheckToAttackDialog(
            html,
            RangedIncrementPenaltyGlobalBonus.dialogDisableKey,
            dialog,
        );
    }

    /**
     * @param {ActionUse} actionUse
     */
    static addRangedPenalty(actionUse) {
        const { actor, shared } = actionUse;
        if (RangedIncrementPenaltyGlobalBonus.isDisabled() || RangedIncrementPenaltyGlobalBonus.isDisabledForActor(actor)) {
            return;
        }
        if (getFormData(actionUse, RangedIncrementPenaltyGlobalBonus.dialogDisableKey)) {
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
                distance: distance.toFixed(1),
                max: maxIncrements * range,
                units: actionUse.action.range.units
            };
            ui.notifications.warn(RangedIncrementPenaltyGlobalBonus._warning(message, args));
            return;
        }

        const total = -(penalty * (steps - 1) + penaltyOffset);
        if (total < 0) {
            const args = {
                range: distance.toFixed(1),
                units: actionUse.action.range.units,
            };
            shared.attackBonus.push(`${total}[${RangedIncrementPenaltyGlobalBonus._attackLabel(RangedIncrementPenaltyGlobalBonus.bonusKey, args)}]`);
        }
    }

    /**
     * @param {ActionUse} actionUse
     * @param {ParsedContextNoteEntry[]} notes
     */
    static addSkipFootnote(actionUse, notes) {
        if (getFormData(actionUse, RangedIncrementPenaltyGlobalBonus.dialogDisableKey)) {
            notes.push(RangedIncrementPenaltyGlobalBonus.disabledFootnote);
        }
    }

    static {
        Hooks.on('renderApplication', RangedIncrementPenaltyGlobalBonus.addSkipRangeToDialog);
        Hooks.on(customGlobalHooks.actionUseAlterRollData, RangedIncrementPenaltyGlobalBonus.addRangedPenalty);
        LocalHookHandler.registerHandler(localHooks.actionUseFootnotes, RangedIncrementPenaltyGlobalBonus.addSkipFootnote)
    }
}
