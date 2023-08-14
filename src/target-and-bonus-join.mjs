import { allBonuses } from "./targeted/bonuses/all-bonuses.mjs";
import { allTargets } from "./targeted/targets/all-targets.mjs";
import { conditionalCalculator } from "./util/conditional-calculator.mjs";
import { localHooks } from "./util/hooks.mjs";
import { truthiness } from "./util/truthiness.mjs";

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ itemSheet,
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    const { actor, item } = itemSheet;

    allBonuses.forEach((bonus) => {
        const hasFlag = item.system.flags.boolean?.hasOwnProperty(bonus.key);
        if (!hasFlag) {
            return;
        }

        bonus.showInputOnItemSheet({ actor, item, html });
    });

    allTargets.forEach((target) => {
        const hasFlag = item.system.flags.boolean?.hasOwnProperty(target.key);
        if (!hasFlag) {
            return;
        }

        target.showInputOnItemSheet({ actor, item, html });
    });
});


// /**
//  * Can't add damage types with this way
//  *
//  * Adds bonus to roll data
//  * @param {ActionUse} actionUse
//  */
// function actionUseAlterRollData(actionUse) {
//     /** @type {string[]} */
//     const damageBonuses = [];
//     allTargets.forEach((target) => {
//         if (target.isTarget(actionUse)) {
//             allBonuses.forEach((bonus) => {
//                 damageBonuses.push(...bonus.getDamageBonusesForRoll(actionUse));
//             });
//         }
//     });
//     actionUse.shared.damageBonus.push(...damageBonuses);
// }
// Hooks.on(localHooks.actionUseAlterRollData, actionUseAlterRollData);

// /**
//  * This way is permanent
//  *
//  * Adds bonus to action's conditionals
//  * @param {ActionUse} actionUse
//  */
// function actionUseAlterRollData(actionUse) {
//     /** @type {string[]} */
//     const conditionals = [];
//     allTargets.forEach((target) => {
//         if (target.isTarget(actionUse)) {
//             allBonuses.forEach((bonus) => {
//                 conditionals.push(...bonus.getConditional(actionUse));
//             });
//         }
//     });
//     actionUse.shared.conditionals.push(...conditionals.map((_, i) => i + actionUse.shared.action.data.conditionals.length))
//     actionUse.shared.action.data.conditionals.push(...conditionals);
// }
// Hooks.on(localHooks.actionUseAlterRollData, actionUseAlterRollData);

/**
 * This way is permanent
 *
 * Adds bonus to action's conditionals
 * @param {ActionUse} actionUse
 */
function actionUseHandleConditionals(actionUse) {
    /** @type {ItemConditional[]} */
    const conditionals = [];
    allTargets.forEach((target) => {
        const bonusTargets = target.isTarget(actionUse);
        bonusTargets.forEach((target) => {
            allBonuses.forEach((bonus) => {
                conditionals.push(...bonus.getConditional(target));
            });
        });
    });

    conditionals
        .filter((c) => truthiness(c) && c.modifiers?.length)
        .forEach((conditional) => {
            conditionalCalculator(actionUse.shared, conditional)
        });
}
Hooks.on(localHooks.actionUseHandleConditionals, actionUseHandleConditionals);

/**
 * Adds change bonus to tooltip
 *
 * @param {ItemAction} action
 * @param {ItemChange[]} sources
 */
function actionDamageSources(action, sources) {
    /** @type {ItemChange[]} */
    const changes = []; dddd
    allTargets.forEach((target) => {
        const bonusTargets = target.isTarget(action);
        bonusTargets.forEach((target) => {
            allBonuses.forEach((bonus) => {
                changes.push(...bonus.getDamageSourcesForTooltip(target));
            });
        });
    });
    sources.push(...changes.filter(truthiness));
}
Hooks.on(localHooks.actionDamageSources, actionDamageSources);
