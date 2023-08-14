import { allBonuses } from "./targeted/bonuses/all-bonuses.mjs";
import { allTargets } from "./targeted/targets/all-targets.mjs";
import { conditionalCalculator } from "./util/conditional-helpers.mjs";
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

/**
 * This way is permanent
 *
 * Adds bonus to action's conditionals
 * @param {ActionUse} actionUse
 */
function actionUseHandleConditionals(actionUse) {
    /** @type {Nullable<ItemConditional>[]} */
    const conditionals = [];
    allTargets.forEach((target) => {
        const bonusTargets = target.isTarget(actionUse);
        bonusTargets.forEach((target) => {
            allBonuses.forEach((bonus) => {
                conditionals.push(bonus.getConditional(target));
            });
        });
    });

    // todo increase luck bonus if actor has fate's favored flag
    conditionals
        .filter((c) => truthiness(c) && c.modifiers?.length)
        .forEach((conditional) => {
            conditionalCalculator(actionUse.shared, conditional)
        });
}
Hooks.on(localHooks.actionUseHandleConditionals, actionUseHandleConditionals);

/**
 * Adds damage bonus to tooltip
 *
 * @param {ItemAction} action
 * @param {ItemChange[]} sources
 */
function actionDamageSources(action, sources) {
    // todo increase luck bonus if actor has fate's favored flag
    /** @type {ItemChange[]} */
    const changes = [];
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

/**
 * Add attack bonus to tooltip
 * @param {ItemPF} item
 * @param {ModifierSource[]} sources
 * @returns {ModifierSource[]}
 */
function getAttackSources(item, sources) {
    // todo increase luck bonus if actor has fate's favored flag
    const actor = item.actor;
    if (!actor) return sources;

    /** @type {ModifierSource[]} */
    const newSources = [];

    allTargets.forEach((target) => {
        const bonusTargets = target.isTarget(item);
        bonusTargets.forEach((target) => {
            allBonuses.forEach((bonus) => {
                newSources.push(...bonus.getAttackSourcesForTooltip(target));
            });
        });
    });

    sources.push(...newSources.filter(truthiness));

    return sources;
}
Hooks.on(localHooks.itemGetAttackSources, getAttackSources);
