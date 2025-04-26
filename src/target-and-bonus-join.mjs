import { MODULE_NAME } from './consts.mjs';
import { BaseBonus } from './targeted/bonuses/_base-bonus.mjs';
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
 * @overload
 * @param {ActionUse | ItemPF | ItemAction} thing
 * @param {(bonusType: typeof BaseBonus, sourceItem: ItemPF) => void} func The type providing the bonus, and the Item providing the bonus
 * @param {object} [options]
 * @param {boolean} [options.skipGenericTarget]
 * @param {never} [options.specificBonusType]
 * @returns {void}
 */

/**
 * @template {typeof BaseBonus} T
 * @overload
 * @param {ActionUse | ItemPF | ItemAction} thing
 * @param {(bonusType: T, sourceItem: ItemPF) => void} func The type providing the bonus, and the Item providing the bonus
 * @param {object} [options]
 * @param {boolean} [options.skipGenericTarget]
 * @param {T} [options.specificBonusType]
 * @returns {void}
 */

/**
 * @template {typeof BaseBonus} T
 * @param {ActionUse | ItemPF | ItemAction} thing
 * @param {(bonusType: T | typeof BaseBonus, sourceItem: ItemPF) => void} func The type providing the bonus, and the Item providing the bonus
 * @param {object} [options]
 * @param {boolean} [options.skipGenericTarget]
 * @param {T | never} [options.specificBonusType]
 */
export const handleBonusesFor = (thing, func, { skipGenericTarget = false, specificBonusType = undefined } = {}) => {
    const actor = thing.actor;
    if (!actor || !actor.itemFlags?.boolean) return;

    let sources = [];
    if (specificBonusType) {
        sources = actor.itemFlags?.boolean[specificBonusType.key]?.sources || [];
    } else {
        const targetKeys = api.allTargetTypes
            .filter((targetType) => !skipGenericTarget || !targetType.isGenericTarget)
            .map((targetType) => targetType.key);

        sources = Object.keys(actor.itemFlags.boolean)
            .filter((key) => key.startsWith('target_') && targetKeys.includes(key))
            .flatMap((key) => actor.itemFlags?.boolean[key].sources)
            .filter(truthiness)
            // filter down to unique items in case one source item is affecting this target item through multiple "targets"
            .filter((sourceItem, i, self) => self.findIndex((nestedTarget) => sourceItem.id === nestedTarget.id) === i);
    }

    sources
        .filter((sourceItem) => {
            const targets = sourceItem[MODULE_NAME].targets
                .filter((targetType) => !skipGenericTarget || !targetType.isGenericTarget);
            const func = sourceItem.getFlag(MODULE_NAME, 'target-toggle') === 'all' ? 'every' : 'some';
            return !!targets.length && targets[func]((sourceTarget) => sourceTarget.doesTargetInclude(sourceItem, thing));
        })
        .forEach((sourceItem) => sourceItem[MODULE_NAME].bonuses.forEach((bonusType) => {
            if (!specificBonusType || bonusType === specificBonusType) {
                func(bonusType, sourceItem);
            }
        }));
}

api.utils.handleBonusesFor = handleBonusesFor;

/**
 * Adds conditional to action being used
 *
 * @param {ActionUse} actionUse
 * @param {ItemConditional[]} conditionals
 */
function actionUseHandleConditionals(actionUse, conditionals) {
    /** @type {Nullable<ItemConditional[]>[]} */
    const nestedConditionals = [];
    handleBonusesFor(
        actionUse,
        (bonusType, sourceItem) => nestedConditionals.push(bonusType.getConditionals(sourceItem, actionUse)),
    );
    const _conditionals = nestedConditionals
        .filter(truthiness)
        .flatMap((x) => x)
        .filter(truthiness);
    conditionals.push(..._conditionals);
}
LocalHookHandler.registerHandler(localHooks.actionUse_handleConditionals, actionUseHandleConditionals);

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
 * @param {ActionUse} action
 * @param {ParsedContextNoteEntry[]} notes
 */
function addFootnotes(action, notes) {
    handleBonusesFor(
        action,
        (bonusType, sourceItem) => notes.push(...(bonusType.getFootnotes(sourceItem, action) ?? []))
    );
}
LocalHookHandler.registerHandler(localHooks.actionUseFootnotes, addFootnotes);

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

    sources.push(...newChanges);
}
Hooks.on(customGlobalHooks.getDamageTooltipSources, getDamageTooltipSources);

/**
 * @param {ChatAttack} chatAttack
 * @param {object} args
 * @param {boolean} args.noAttack
 * @param {unknown} args.bonus
 * @param {string[]} args.extraParts
 * @param {boolean} args.critical Whether or not this roll is a for a critical confirmation
 * @param {object} args.conditionalParts
 */
const preRollChatAttackAddAttack = async (chatAttack, args) => {
    if (!args.critical) return;

    handleBonusesFor(
        chatAttack.action,
        (bonusType, sourceItem) => {
            if (args.critical) {
                const part = bonusType.getCritBonusParts(sourceItem);
                if (part) {
                    const parts = Array.isArray(part) ? part : [part];
                    args.extraParts.push(...parts);
                }
            }
        }
    );
}
LocalHookHandler.registerHandler(localHooks.preRollChatAttackAddAttack, preRollChatAttackAddAttack);

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
