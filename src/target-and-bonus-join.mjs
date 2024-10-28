import { MODULE_NAME } from './consts.mjs';
import { BaseBonus } from './targeted/bonuses/base-bonus.mjs';
import { conditionalCalculator } from "./util/conditional-helpers.mjs";
import { LocalHookHandler, customGlobalHooks, localHooks } from "./util/hooks.mjs";
import { registerItemHint } from "./util/item-hints.mjs";
import { localize } from "./util/localize.mjs";
import { truthiness } from "./util/truthiness.mjs";
import { initSources } from './targeted/init-sources.mjs';
import { api } from './util/api.mjs';
import { registerGlobalBonuses } from './global-bonuses/init-global-bonuses.mjs';

initSources();
registerGlobalBonuses();

registerItemHint((hintcls, actor, item, _data) => {
    if (!actor || item?.actor !== actor) {
        return;
    }

    /** @type {Hint[]} */
    const allHints = [];

    /** @type {string[]} */
    const targetSourceHints = [];
    // register hints on target source
    item[MODULE_NAME].targets.forEach((targetType) => {
        const hints = targetType.getHints(item);
        if (hints?.length) {
            targetSourceHints.push([...new Set([targetType.label, ...hints])].join('\n'));
        }
    });
    if (targetSourceHints.length) {
        allHints.push(hintcls.create(
            localize('targets'),
            [],
            { hint: targetSourceHints.join('\n\n') },
        ));
    }

    /** @type {Hint[]} */
    const bonusSourceHints = [];
    // register hints on bonus source
    item[MODULE_NAME].bonuses.forEach((bonusType) => {
        let hints = bonusType.getHints(item);
        if (hints?.length) {
            // remove hint tooltip if it's the same as the label
            if (hints.length === 1 && hints[0] === bonusType.label) {
                hints = [];
            }
            bonusSourceHints.push(hintcls.create(
                bonusType.label,
                [],
                { hint: hints.join('\n') },
            ));
        }
    });
    allHints.push(...bonusSourceHints);

    /** @type {{itemName: string, bonusName: string, hints: string[]}[]} */
    const bonusHints = [];
    //register hints on targeted item
    handleBonusesFor(
        item,
        (bonusType, sourceItem) => {
            if (bonusType.skipTargetedHint) return;
            let hints = bonusType.getHints(sourceItem, item);
            if (hints?.length) {
                if (hints.length === 1 && hints[0] === bonusType.label) {
                    hints = [];
                }
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

    if (item[MODULE_NAME].bonuses.length && !item[MODULE_NAME].targets.length) {
        const hint = hintcls.create(localize('missing-targets'), ['ckl-missing-source'], { icon: 'fas fa-circle-exclamation' });
        return [hint, ...allHints];
    }
    else if (item[MODULE_NAME].targets.length && !item[MODULE_NAME].bonuses.length) {
        const hint = hintcls.create(localize('missing-bonuses'), ['ckl-missing-source'], { icon: 'fas fa-circle-exclamation' });
        return [hint, ...allHints];
    }
    else {
        return allHints;
    }
});

/**
 * @param {ActionUse | ItemPF | ItemAction} thing
 * @param {(bonusType: typeof BaseBonus, sourceItem: ItemPF) => void} func The type providing the bonus, and the Item providing the bonus
 * @param {object} [options]
 * @param {boolean} [options.skipGenericTarget]
 */
export const handleBonusesFor = (thing, func, { skipGenericTarget = false } = {}) => {
    api.allTargetTypes
        .filter((targetType) => !skipGenericTarget || !targetType.isGenericTarget)
        .flatMap((targetType) => targetType.getSourcesFor(thing))
        // filter down to unique items in case one source item is affecting this target item through multiple "targets"
        .filter((sourceItem, i, self) => self.findIndex((nestedTarget) => sourceItem.id === nestedTarget.id) === i)
        .filter((sourceItem) => {
            const targets = sourceItem[MODULE_NAME].targets
                .filter((sourceTarget) => !skipGenericTarget || !sourceTarget.isGenericTarget);
            const func = sourceItem.getFlag(MODULE_NAME, 'target-toggle') === 'all' ? 'every' : 'some';
            return targets[func]((sourceTarget) => sourceTarget.doesTargetInclude(sourceItem, thing));
        })
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
    api.allTargetTypes
        .filter((targetType) => !skipGenericTarget || !targetType.isGenericTarget)
        .flatMap((targetType) => targetType.getSourcesFor(thing))
        // filter down to unique items in case one source item is affecting this target item through multiple "targets"
        .filter((sourceItem, i, self) => self.findIndex((nestedTarget) => sourceItem.id === nestedTarget.id) === i)
        .filter((sourceItem) => {
            const targets = sourceItem[MODULE_NAME].targets
                .filter((sourceTarget) => !skipGenericTarget || !sourceTarget.isGenericTarget)
            const func = sourceItem.getFlag(MODULE_NAME, 'target-toggle') === 'all' ? 'every' : 'some';
            return targets[func]((sourceTarget) => sourceTarget.doesTargetInclude(sourceItem, thing));
        })
        .forEach((sourceItem) => sourceItem[MODULE_NAME].bonuses.forEach((bonusType) => {
            if (bonusType === specificBonusType) {
                func(specificBonusType, sourceItem);
            }
        }));
}

api.utils.handleBonusesFor = handleBonusesFor;
api.utils.handleBonusTypeFor = handleBonusTypeFor;

/**
 * Adds conditional to action being used
 *
 * @param {ActionUse} actionUse
 */
function actionUseHandleConditionals(actionUse) {
    /** @type {Nullable<ItemConditional[]>[]} */
    const conditionals = [];
    handleBonusesFor(
        actionUse,
        (bonusType, sourceItem) => conditionals.push(bonusType.getConditionals(sourceItem, actionUse)),
    );

    conditionals
        .filter(truthiness)
        .flatMap((x) => x)
        .filter(truthiness)
        .filter((c) => c.data.modifiers.length)
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
function actionUseAlterRollData(actionUse) {
    const { actor, item, shared } = actionUse;
    if (!actor || item.actor !== actor) {
        return;
    }

    handleBonusesFor(
        actionUse,
        (bonusType, sourceItem) => bonusType.actionUseAlterRollData(sourceItem, shared),
    );
}
Hooks.on(customGlobalHooks.actionUseAlterRollData, actionUseAlterRollData);

/**
 * @param {ChatAttack} chatAttack
 * @param {string[]} notes
 */
function addFootnotes(chatAttack, notes) {
    const { action } = chatAttack;
    handleBonusesFor(
        action,
        (bonusType, sourceItem) => notes.push(...(bonusType.getFootnotes(sourceItem, action) ?? []))
    );
}
Hooks.on(customGlobalHooks.actionUseFootnotes, addFootnotes);

/**
 * @param {ItemAction} action
 * @param {{proficient: boolean, secondaryPenalty: boolean}} config
 * @param {RollData} rollData
 * @param {D20RollConstructorOptions} rollOptions
 * @param {string[]} parts
 * @param {ItemChange[]} changes
 */
function onPreRollAttack(action, config, rollData, rollOptions, parts, changes) {
    handleBonusesFor(
        action,
        (bonusType, sourceItem) => bonusType.modifyPreRollAttack(sourceItem, action, config, rollData, rollOptions, parts, changes)
    );
}
Hooks.on('pf1PreAttackRoll', onPreRollAttack);

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
        (bonusType, sourceItem) => newSources.push(...bonusType.getAttackSourcesForTooltip(sourceItem, item)),
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
 * @param {ItemPF} thing
 * @param {ItemChange[]} sources
 */
function getDamageTooltipSources(thing, sources) {
    /** @type {ItemChange[]} */
    const changes = [];

    handleBonusesFor(
        thing,
        (bonusType, sourceItem) => changes.push(...bonusType.getDamageSourcesForTooltip(sourceItem, thing)),
    );

    const newChanges = changes.filter(truthiness);

    // todo increase luck bonus if actor has fate's favored flag (double check that there isn't a named bonus for that already)
    sources.push(...newChanges);
}
Hooks.on(customGlobalHooks.getDamageTooltipSources, getDamageTooltipSources);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    item[MODULE_NAME].bonuses.forEach((bonusType) => {
        bonusType.showInputOnItemSheet({ actor, item, isEditable, html });
    });

    item[MODULE_NAME].targets.forEach((targetType) => {
        targetType.showInputOnItemSheet({ actor, item, isEditable, html });
    });

    item[MODULE_NAME].targetOverrides.forEach((override) => {
        if (override.isInvalidItemType(item)) {
            override.showInvalidInput({ actor, item, isEditable, html });
        }
        else {
            override.showInputOnItemSheet({ actor, item, isEditable, html });
        }
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

/**
 * @param {ActionUse} actionUse
 */
function actionUseProcess(actionUse) {
    handleBonusesFor(
        actionUse,
        (bonusType, sourceItem) => bonusType.actionUseProcess(sourceItem, actionUse),
    );
};
LocalHookHandler.registerHandler(localHooks.actionUseProcess, actionUseProcess);

/**
 * @param {ItemAction} action
 * @param {{ dc: number }} seed
 */
function modifyActionLabelDC(action, seed) {
    handleBonusesFor(
        action,
        (bonusType, sourceItem) => seed.dc += bonusType.modifyActionLabelDC(sourceItem, action),
    );
};
LocalHookHandler.registerHandler(localHooks.modifyActionLabelDC, modifyActionLabelDC);

/**
 * @param {ItemPF} item
 * @param {RollData} rollData
 */
const prepare = (item, rollData) => {
    item[MODULE_NAME].bonuses = [];
    item[MODULE_NAME].targets = [];
    item[MODULE_NAME].targetOverrides = [];

    api.allBonusTypes.forEach((bonusType) => {
        if (bonusType.isSource(item)) {
            item[MODULE_NAME].bonuses.push(bonusType);
            bonusType.prepareSourceData(item, rollData);
        }
    });
    api.allTargetTypes.forEach((targetType) => {
        if (targetType.isSource(item)) {
            item[MODULE_NAME].targets.push(targetType);
            targetType.prepareSourceData(item, rollData);
        }
    });
    api.allTargetOverrideTypes.forEach((overrideType) => {
        if (overrideType.isSource(item)) {
            item[MODULE_NAME].targetOverrides.push(overrideType);
            if (!overrideType.isInvalidItemType(item)) {
                overrideType.prepareSourceData(item, rollData);
            }
        }
    });

};
LocalHookHandler.registerHandler(localHooks.prepareData, prepare);

/**
 * @param {ItemActionRollAttackHookArgs} seed
 * @param {ItemAction} action
 * @param {RollData} data
 * @returns {void}
 */
const itemActionRollAttack = (seed, action, data) => {
    handleBonusesFor(
        action,
        (bonusType, sourceItem) => bonusType.itemActionRollAttack(sourceItem, seed, action, data),
    );
};
LocalHookHandler.registerHandler(localHooks.itemActionRollAttack, itemActionRollAttack);

/**
 * @param {ItemPF} item
 * @returns {void}
 */
const itemPF_prepareScriptCalls = (item) => {
    handleBonusesFor(
        item,
        (bonusType, sourceItem) => {
            const script = bonusType.getScriptCalls(sourceItem);
            if (script) {
                item.scriptCalls ||= new Collection();
                const scripts = Array.isArray(script) ? script : [script];
                scripts.forEach((s) => {
                    s.parent = item;
                    item.scriptCalls.set(s.id, s);
                });
            }
        },
    );
};
LocalHookHandler.registerHandler(localHooks.itemPF_prepareScriptCalls, itemPF_prepareScriptCalls);

/**
 * @param {{base: number, stacks: number}} seed
 * @param {ItemAction} action
 */
const itemActionEnhancementBonus = (seed, action) => {
    handleBonusesFor(
        action,
        (bonusType, sourceItem) => bonusType.itemActionEnhancementBonus(sourceItem, seed, action),
    );
}
LocalHookHandler.registerHandler(localHooks.itemActionEnhancementBonus, itemActionEnhancementBonus);

/**
 * @param {ItemActionRollAttackHookArgs} seed
 * @param {ItemAction} action
 * @param {RollData} data
 * @param {number} index
 * @returns {void}
 */
const itemActionRollDamage = (seed, action, data, index) => {
    handleBonusesFor(
        action,
        (bonusType, sourceItem) => bonusType.itemActionRollDamage(sourceItem, seed, action, data, index),
    );
};
LocalHookHandler.registerHandler(localHooks.itemActionRollDamage, itemActionRollDamage);

/**
 * @param {ItemPF} item
 * @param {string[]} props
 * @param {RollData} rollData
 */
const itemGetTypeChatData = (item, props, rollData) => {
    handleBonusesFor(
        item,
        (bonusType, sourceItem) => props.push(...(bonusType.getItemChatCardInfo(sourceItem, rollData) || []))
    );
};
Hooks.on(customGlobalHooks.itemGetTypeChatData, itemGetTypeChatData);

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
};
LocalHookHandler.registerHandler(localHooks.updateItemActionRollData, updateItemActionRollData)
