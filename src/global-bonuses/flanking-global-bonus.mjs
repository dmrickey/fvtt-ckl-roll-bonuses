import { Sources } from '../targeted/source-registration.mjs';
import { FlankHelper } from '../util/flank-helper.mjs';
import { customGlobalHooks } from '../util/hooks.mjs';
import { BaseGlobalBonus } from './base-global-bonus.mjs';
import { Outflank } from './specific/bonuses/flanking/outflank.mjs';
import { MenacingBonus } from './targeted/bonuses/menacing.mjs';

/** @type {ActionType[]} */
const rangedTypes = ['rwak', 'rcman', 'rsak', 'twak'];

/** @extends {BaseGlobalBonus} */
export class FlankingGlobalBonus extends BaseGlobalBonus {
    static get #currentTargets() { return [...game.user.targets]; }

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
    static addFlanking(actionUse) {
        const { action, actor, shared, token } = actionUse;
        if (this.isDisabled() || this.isDisabledForActor(actor)) {
            return;
        }

        if (!this.#currentTargets.length) {
            return;
        }

        const helpers = this.#currentTargets.map((target) => new FlankHelper(token, target, { action: action }));
        if (!helpers.every(x => x.isFlanking)) {
            return;
        }

        const helper = helpers.reduce((a, b) => a.totalBonus >= b.totalBonus ? a : b);
        if (helper) {
            shared.attackBonus.push(helper.formula);
        }
    }

    static {
        Hooks.on(customGlobalHooks.actionUseAlterRollData, this.addFlanking.bind(this));
    }
}
