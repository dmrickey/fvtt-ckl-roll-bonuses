import { Sources } from '../targeted/source-registration.mjs';
import { FlankHelper } from '../util/flank-helper.mjs';
import { currentTargets } from '../util/get-current-targets.mjs';
import { customGlobalHooks } from '../util/hooks.mjs';
import { BaseGlobalBonus } from './base-global-bonus.mjs';
import { Outflank } from './specific/bonuses/flanking/outflank.mjs';
import { MenacingBonus } from './targeted/bonuses/menacing.mjs';

/** @type {ActionType[]} */
const rangedTypes = ['rwak', 'rcman', 'rsak', 'twak'];

/** @extends {BaseGlobalBonus} */
export class FlankingGlobalBonus extends BaseGlobalBonus {
    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get bonusKey() { return 'flanking'; }

    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.4A4bCh8VsQVbTsAY#flanking'; }

    /**
     * @inheritdoc
     * @override
     */
    static registerBonuses() {
        Outflank.register();
        Sources.registerSource(MenacingBonus);
    }

    /**
     * @param {ActionUse} actionUse
     */
    static #isFlanking(actionUse) {
        const { action, actor, shared, token } = actionUse;
        if (this.isDisabled() || this.isDisabledForActor(actor)) {
            return;
        }

        const targets = currentTargets();
        if (!targets.length) {
            return;
        }

        const helpers = targets.map((target) => new FlankHelper(token, target, { action: action }));
        if (!helpers.every(x => x.isFlanking)) {
            return;
        }

        const helper = helpers.reduce((a, b) => a.totalBonus >= b.totalBonus ? a : b);
        return helper;
    }

    /**
     * @param {ActionUse} actionUse
     */
    static addFlanking(actionUse) {
        if (!actionUse.shared.flanking) return;

        const helper = this.#isFlanking(actionUse);
        if (helper) {
            // the system already adds base flanking, so I need to only add Improved Outflank and Menacing
            const formula = helper.formulaWithoutBase;
            if (formula) {
                actionUse.shared.attackBonus.push(formula);
            }
        }
    }

    /** @param {ActionUse} actionUse */
    static preEnableFlankingCheck(actionUse) {
        if (this.#isFlanking(actionUse)) {
            actionUse.shared.useOptions.flanking = true;
        }
    }

    static {
        Hooks.on('pf1CreateActionUse', this.preEnableFlankingCheck.bind(this));
        Hooks.on(customGlobalHooks.actionUseAlterRollData, this.addFlanking.bind(this));
    }
}
