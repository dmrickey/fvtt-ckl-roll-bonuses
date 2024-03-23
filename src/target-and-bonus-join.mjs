import { MODULE_NAME } from './consts.mjs';
import { allBonusTypes } from "./targeted/bonuses/all-bonuses.mjs";
import { BaseBonus } from './targeted/bonuses/base-bonus.mjs';
import { allTargetTypes } from "./targeted/targets/all-targets.mjs";
import { conditionalCalculator } from "./util/conditional-helpers.mjs";
import { LocalHookHandler, customGlobalHooks, localHooks } from "./util/hooks.mjs";
import { registerItemHint } from "./util/item-hints.mjs";
import { localize } from "./util/localize.mjs";
import { truthiness } from "./util/truthiness.mjs";

function init() {
    allTargetTypes.forEach((targetType) => targetType.init());
    allBonusTypes.forEach((bonusType) => bonusType.init());
};
init();

registerItemHint((hintcls, actor, item, _data) => {
    if (!actor || item?.actor !== actor) {
        return;
    }

    /** @type {Hint[]} */
    const allHints = [];
    // register hints on bonus source
    item[MODULE_NAME].bonuses.forEach((bonusType) => {
        let hints = bonusType.getHints(item);
        if (hints?.length) {
            // remove hint tooltip if it's the same as the label
            if (hints.length === 1 && hints[0] === bonusType.label) {
                hints = [];
            }
            allHints.push(hintcls.create(bonusType.label, [], { hint: hints.join('\n') }));
        }
    });

    /** @type {string[]} */
    const targetHints = [];
    // register hints on target source
    item[MODULE_NAME].targets.forEach((targetType) => {
        const hints = targetType.getHints(item);
        if (hints?.length) {
            targetHints.push([...new Set([targetType.label, ...hints])].join('\n'));
        }
    });

    if (targetHints.length) {
        allHints.push(hintcls.create(localize('bonus-target.target.label.target'), [], { hint: targetHints.join('\n\n') }));
    }

    /** @type {{itemName: string, bonusName: string, hints: string[]}[]} */
    const bonusHints = [];
    //register hints on targeted item
    handleBonusesFor(
        item,
        (bonusType, sourceItem) => {
            const hints = bonusType.getHints(sourceItem, item);
            if (hints?.length) {
                bonusHints.push({ itemName: sourceItem.name, bonusName: bonusType.label, hints });
            }
        },
        { skipGenericTarget: true }
    );
    if (bonusHints.length) {
        const hints = bonusHints
            .reduce(
                (/** @type {{[key: string]: string}} */ acc, curr) => {
                    if (acc[curr.itemName]) {
                        acc[curr.itemName] += '\n\n';
                    }
                    acc[curr.itemName] ||= '';
                    acc[curr.itemName] += [curr.bonusName, ...curr.hints].join('\n');
                    return acc;
                },
                {},
            );
        Object.entries(hints)
            .forEach(([name, hint]) => allHints.push(hintcls.create(name, [], { hint })))
    }

    return allHints;
});

/**
 * @param {ActionUse | ItemPF | ItemAction} thing
 * @param {(bonusType: typeof BaseBonus, sourceItem: ItemPF) => void} func The type providing the bonus, and the Item providing the bonus
 * @param {object} [options]
 * @param {boolean} [options.skipGenericTarget]
 */
export const handleBonusesFor = (thing, func, { skipGenericTarget = false } = {}) => {
    allTargetTypes
        .filter((targetType) => !skipGenericTarget || !targetType.isGenericTarget)
        .flatMap((targetType) => targetType.getBonusSourcesForTarget(thing))
        // filter down to unique items in case one source item is affecting this target item through multiple "targets"
        .filter((sourceItem, i, self) => self.findIndex((nestedTarget) => sourceItem.id === nestedTarget.id) === i)
        .filter((sourceItem) => sourceItem[MODULE_NAME].targets.every((baseTarget) =>
            (!skipGenericTarget || !baseTarget.isGenericTarget) && baseTarget.doesTargetInclude(sourceItem, thing))
        )
        .forEach((sourceItem) => sourceItem[MODULE_NAME].bonuses.forEach((bonusType) => func(bonusType, sourceItem)));
}

/**
 * @template {typeof BaseBonus} T
 * @param {ActionUse | ItemPF | ItemAction} thing
 * @param {T} specificBonusType
 * @param {(bonusType: T, sourceItem: ItemPF) => void} func
 * @param {object} [options]
 * @param {boolean} [options.skipGenericTarget]
 */
export const handleBonusTypeFor = (thing, specificBonusType, func, { skipGenericTarget = false } = {}) => {
    allTargetTypes
        .filter((targetType) => !skipGenericTarget || !targetType.isGenericTarget)
        .flatMap((targetType) => targetType.getBonusSourcesForTarget(thing))
        // filter down to unique items in case one source item is affecting this target item through multiple "targets"
        .filter((sourceItem, i, self) => self.findIndex((nestedTarget) => sourceItem.id === nestedTarget.id) === i)
        .filter((sourceItem) => sourceItem[MODULE_NAME].targets.every((baseTarget) =>
            (!skipGenericTarget || !baseTarget.isGenericTarget) && baseTarget.doesTargetInclude(sourceItem, thing))
        )
        .forEach((sourceItem) => sourceItem[MODULE_NAME].bonuses.forEach((bonusType) => {
            if (bonusType === specificBonusType) {
                func(specificBonusType, sourceItem);
            }
        }));
}

/**
 * Adds conditional to action being used
 *
 * @param {ActionUse} actionUse
 */
function actionUseHandleConditionals(actionUse) {
    /** @type {Nullable<ItemConditional>[]} */
    const conditionals = [];
    handleBonusesFor(
        actionUse,
        (bonusType, sourceItem) => conditionals.push(bonusType.getConditional(sourceItem)),
    );

    conditionals
        .filter((c) => c?.modifiers?.length)
        .forEach((conditional) => conditionalCalculator(actionUse.shared, conditional));

    // todo reduce attack bonus highest of each type
    // todo increase luck bonus if actor has fate's favored flag
}
Hooks.on(customGlobalHooks.actionUseHandleConditionals, actionUseHandleConditionals);

/**
 * Alters roll data for attack rolls - for simple changes that don't need an ItemConditional/Modifier or ItemChange
 *
 * @param {ActionUse} actionUse
 */
function actionUseAlterRollData({ actor, item, shared }) {
    if (!actor || item.actor !== actor) {
        return;
    }

    handleBonusesFor(
        item,
        (bonusType, sourceItem) => bonusType.actionUseAlterRollData(sourceItem, shared),
    );
}
Hooks.on(customGlobalHooks.actionUseAlterRollData, actionUseAlterRollData);

/**
 * @param {ChatAttack} chatAttack
 */
function addFootnotes({ action, attackNotes }) {
    handleBonusesFor(
        action,
        (bonusType, sourceItem) => attackNotes.push(...bonusType.getFootnotes(sourceItem, action))
    );
}
Hooks.on(customGlobalHooks.chatAttackFootnotes, addFootnotes);

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

    handleBonusesFor(
        item,
        (bonusType, sourceItem) => newSources.push(...bonusType.getAttackSourcesForTooltip(sourceItem)),
    );

    newSources = newSources.filter(truthiness);

    sources.push(...newSources);
    // todo reduce attack bonus highest of each type
    // todo increase luck bonus if actor has fate's favored flag

    return sources;
}
Hooks.on(customGlobalHooks.itemGetAttackSources, getAttackSources);

/**
 * Add damage bonus to actor's Combat damage column tooltip
 *
 * @param {ItemAction} action
 * @param {ItemChange[]} sources
 */
function actionDamageSources(action, sources) {
    /** @type {ItemChange[]} */
    const changes = [];

    handleBonusesFor(
        action,
        (bonusType, sourceItem) => changes.push(...bonusType.getDamageSourcesForTooltip(sourceItem)),
    );

    const newChanges = changes.filter(truthiness);

    // todo increase luck bonus if actor has fate's favored flag (double check that there isn't a named bonus for that already)
    sources.push(...newChanges);
}
Hooks.on(customGlobalHooks.actionDamageSources, actionDamageSources);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ itemSheet,
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    const { actor, item } = itemSheet;

    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    item[MODULE_NAME].bonuses.forEach((bonusType) => {
        bonusType.showInputOnItemSheet({ actor, item, html });
    });

    item[MODULE_NAME].targets.forEach((targetType) => {
        targetType.showInputOnItemSheet({ actor, item, html });
    });
});

Hooks.on('updateItem', (
    /** @type {ItemPF} */ item,
    /** @type {{ system?: { active?: boolean, disabled?: boolean} }} */ change,
    /** @type {object} */ _options,
    /** @type {string} */ userId,
) => {
    if (game.userId !== userId) {
        return;
    }

    if (!change?.system?.active || change?.system?.disabled === true) {
        return;
    }

    item[MODULE_NAME].targets.forEach((targetType) => {
        if (targetType.showOnActive) {
            targetType.showTargetEditor(item);
        }
    });
});

Hooks.on(customGlobalHooks.itemUse, (
    /** @type {ItemPF} */ item,
    /** @type {{ fortuneCount: number; misfortuneCount: number; actionID: any; }} */ options
) => {
    handleBonusesFor(
        item,
        (bonusType, sourceItem) => bonusType.onItemUse(sourceItem, options),
    );
});

/**
 * @param {ItemPF} item
 * @param {RollData} _rollData
 */
const prepare = (item, _rollData) => {
    item[MODULE_NAME].bonuses = [];
    item[MODULE_NAME].targets = [];

    allBonusTypes.forEach((bonusType) => {
        if (bonusType.isBonusSource(item)) {
            item[MODULE_NAME].bonuses.push(bonusType);
            bonusType.prepareData(item, _rollData);
        }
    });
    allTargetTypes.forEach((targetType) => {
        if (targetType.isTargetSource(item)) {
            item[MODULE_NAME].targets.push(targetType);
            targetType.prepareData(item, _rollData);
        }
    });
};
LocalHookHandler.registerHandler(localHooks.prepareData, prepare);

/**
 * @param {ItemActionRollAttackHookArgs} seed
 * @param {ItemAction} action
 * @param {RollData} data
 * @returns {Promise<ItemActionRollAttackHookArgs>}
 */
const itemActionRollAttack = async (seed, action, data) => {
    handleBonusesFor(
        action,
        (bonusType, sourceItem) => bonusType.itemActionRollAttack(sourceItem, seed, action, data),
    );
    return seed;
}
LocalHookHandler.registerHandler(localHooks.itemActionRollAttack, itemActionRollAttack);

/**
 * @param {ItemActionRollAttackHookArgs} seed
 * @param {ItemAction} action
 * @param {RollData} data
 * @returns {Promise<ItemActionRollAttackHookArgs>}
 */
const itemActionRollDamage = async (seed, action, data) => {
    handleBonusesFor(
        action,
        (bonusType, sourceItem) => bonusType.itemActionRollDamage(sourceItem, seed, action, data),
    );
    return seed;
}
LocalHookHandler.registerHandler(localHooks.itemActionRollAttack, itemActionRollDamage);

/**
 *
 * @param {ItemAction} action
 * @param {RollData} rollData
 */
const updateItemActionRollData = (action, rollData) => {
    handleBonusesFor(
        action,
        (bonusType, sourceItem) => bonusType.updateItemActionRollData(sourceItem, action, rollData),
    );
}
LocalHookHandler.registerHandler(localHooks.updateItemActionRollData, updateItemActionRollData)
