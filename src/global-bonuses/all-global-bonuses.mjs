import { MODULE_NAME } from '../consts.mjs';
import { addGlobalBonusDisablerToActor } from '../handlebars-handlers/global-bonuses/add-global-bonus-disabler-to-actor.mjs';
import { api } from '../util/api.mjs';
import { LocalHookHandler, localHooks } from '../util/hooks.mjs';
import { GlobalBonusSettings } from '../util/settings.mjs';
import { BaseGlobalBonus } from './base-global-bonus.mjs';

export class GlobalBonuses {
    /**
     * @param {typeof BaseGlobalBonus} bonus
     */
    static registerBonus(bonus) {
        GlobalBonuses.allBonuses.push(bonus);
        GlobalBonusSettings.registerKey(bonus);

        // settings are ready after `i18nInit` hook
        Hooks.once('i18nInit', () => {
            if (GlobalBonusSettings.setting(bonus.key)) {
                bonus.registerBonuses();
            }
        });

        api.globalTypeMap[bonus.key] = bonus;
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
    const bonuses = GlobalBonuses.allBonuses
        .filter((b) => !b.isDisabled());
    const settings = bonuses.map((b) => ({
        checked: b.isDisabledForActor(actor),
        journal: b.journal,
        label: b.label,
        path: `flags.${MODULE_NAME}.${b.actorDisabledFlag}`,
    }));

    addGlobalBonusDisablerToActor(html, settings, isEditable);
});
