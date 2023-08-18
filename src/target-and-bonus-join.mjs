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
 * Adds conditional to action being used
 *
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
    conditionals
        .filter((c) => truthiness(c) && c.modifiers?.length)
        .forEach((conditional) => {
            conditionalCalculator(actionUse.shared, conditional)
        });

    // todo reduce attack bonus highest of each type

    // todo increase luck bonus if actor has fate's favored flag
}
Hooks.on(localHooks.actionUseHandleConditionals, actionUseHandleConditionals);

/**
 * Alters roll data for attack rolls - for simple changes that don't need an ItemConditional/Modifier or ItemChange
 *
 * @param {ActionUse} actionUse
 */
function actionUseAlterRollData({ actor, item, shared }) {
    if (!actor || item.actor !== actor) {
        return;
    }

    allTargets.forEach((target) => {
        const bonusTargets = target.isTarget(item);
        bonusTargets.forEach((target) => {
            allBonuses.forEach((bonus) => {
                bonus.actionUseAlterRollData(target, shared);
            });
        });
    });
}
Hooks.on(localHooks.actionUseAlterRollData, actionUseAlterRollData);

/**
 * Add attack bonus to actor's Combat attacks column tooltip
 *
 * @param {ItemPF} item
 * @param {ModifierSource[]} sources
 * @returns {ModifierSource[]}
 */
function getAttackSources(item, sources) {
    const actor = item.actor;
    if (!actor) return sources;

    /** @type {ModifierSource[]} */
    let newSources = [];

    allTargets.forEach((target) => {
        const bonusTargets = target.isTarget(item);
        bonusTargets.forEach((target) => {
            allBonuses.forEach((bonus) => {
                newSources.push(...bonus.getAttackSourcesForTooltip(target));
            });
        });
    });

    newSources = newSources.filter(truthiness);

    sources.push(...newSources);
    // todo reduce attack bonus highest of each type
    // todo increase luck bonus if actor has fate's favored flag

    return sources;
}
Hooks.on(localHooks.itemGetAttackSources, getAttackSources);

/**
 * Add damage bonus to actor's Combat damage column tooltip
 *
 * @param {ItemAction} action
 * @param {ItemChange[]} sources
 */
function actionDamageSources(action, sources) {
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
    // todo increase luck bonus if actor has fate's favored flag (double check that there isn't a named bonus for that already)
    sources.push(...changes.filter(truthiness));
}
Hooks.on(localHooks.actionDamageSources, actionDamageSources);
