import { allBonusTypes } from "./targeted/bonuses/all-bonuses.mjs";
import { allTargetTypes } from "./targeted/targets/all-targets.mjs";
import { conditionalCalculator } from "./util/conditional-helpers.mjs";
import { localHooks } from "./util/hooks.mjs";
import { registerItemHint } from "./util/item-hints.mjs";
import { truthiness } from "./util/truthiness.mjs";

/**
 * Register hint on target
 */
registerItemHint((hintcls, actor, item, _data) => {
    if (!actor || item?.actor !== actor) {
        return;
    }

    /** @type {Hint[]} */
    const hints = [];

    allBonusTypes.forEach((bonus) => {
        if (bonus.isBonusSource(item)) {
            const args = bonus.registerHintOnBonus(item);
            if (!args) return;

            const { label, cssClasses, options } = args;
            hints.push(hintcls.create(label, cssClasses || [], options || {}));
        }
    });

    allTargetTypes.forEach((target) => {
        const bonuses = target.isTarget(item);
        bonuses.forEach((bonusTarget) => {
            allBonusTypes.forEach((bonus) => {
                const args = bonus.registerHintOnTarget(bonusTarget);
                if (!args) return;

                const { label, cssClasses, options } = args;
                hints.push(hintcls.create(label, cssClasses || [], options || {}));
            });
        });
    });

    return hints;
});

/**
 * Adds conditional to action being used
 *
 * @param {ActionUse} actionUse
 */
function actionUseHandleConditionals(actionUse) {
    /** @type {Nullable<ItemConditional>[]} */
    const conditionals = [];
    allTargetTypes.forEach((target) => {
        const bonuses = target.isTarget(actionUse);
        bonuses.forEach((bonusTarget) => {
            allBonusTypes.forEach((bonus) => {
                conditionals.push(bonus.getConditional(bonusTarget));
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

    allTargetTypes.forEach((target) => {
        const bonuses = target.isTarget(item);
        bonuses.forEach((target) => {
            allBonusTypes.forEach((bonus) => {
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

    allTargetTypes.forEach((target) => {
        const bonuses = target.isTarget(item);
        bonuses.forEach((bonusTarget) => {
            allBonusTypes.forEach((bonus) => {
                newSources.push(...bonus.getAttackSourcesForTooltip(bonusTarget));
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
    allTargetTypes.forEach((target) => {
        const bonuses = target.isTarget(action);
        bonuses.forEach((bonusTarget) => {
            allBonusTypes.forEach((bonus) => {
                changes.push(...bonus.getDamageSourcesForTooltip(bonusTarget));
            });
        });
    });
    // todo increase luck bonus if actor has fate's favored flag (double check that there isn't a named bonus for that already)
    sources.push(...changes.filter(truthiness));
}
Hooks.on(localHooks.actionDamageSources, actionDamageSources);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ itemSheet,
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    const { actor, item } = itemSheet;

    allBonusTypes.forEach((bonus) => {
        const hasFlag = item.system.flags.boolean?.hasOwnProperty(bonus.key);
        if (!hasFlag) {
            return;
        }

        bonus.showInputOnItemSheet({ actor, item, html });
    });

    allTargetTypes.forEach((target) => {
        const hasFlag = item.system.flags.boolean?.hasOwnProperty(target.key);
        if (!hasFlag) {
            return;
        }

        target.showInputOnItemSheet({ actor, item, html });
    });
});
