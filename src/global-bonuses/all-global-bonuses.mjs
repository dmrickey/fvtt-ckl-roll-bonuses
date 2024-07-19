import { LocalHookHandler, localHooks } from '../util/hooks.mjs';
import { GlobalBonusSettings } from '../util/settings.mjs';
import { BaseGlobalBonus } from './base-global-bonus.mjs';

export class GlobalBonuses {
    /**
     * @param {typeof BaseGlobalBonus} bonus
     */
    static registerBonus(bonus) {
        GlobalBonuses.allBonuses.push(bonus);
        GlobalBonusSettings.registerKey(bonus.key);
    }

    /**
     * @type {Array<typeof BaseGlobalBonus>}}
     */
    static allBonuses = [];
}

/**
 * @param {ItemAction} action
 * @param {RollData} rollData
 */
function initRollData(action, rollData) {
    GlobalBonuses.allBonuses.forEach((bonus) => {
        const { actor } = action;
        if (bonus.isDisabled() || bonus.isDisabledForActor(actor)) {
            return;
        }

        bonus.initRollData(action, rollData);
    });
}
LocalHookHandler.registerHandler(localHooks.initItemActionRollData, initRollData);

Hooks.on('renderActorSheet', (
    /** @type {ActorSheetPF} */ { actor, isEditable },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    GlobalBonuses.allBonuses.forEach((bonus) => {
        if (!(actor instanceof pf1.documents.actor.ActorBasePF)) return;
        if (bonus.isDisabled()) return;

        console.error('rendering actor checkbox for:', bonus);
        // todo add checkbox/label/journal link
    });
});
