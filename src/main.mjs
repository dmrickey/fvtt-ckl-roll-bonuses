import { FRIENDLY_MODULE_NAME, MODULE_NAME } from './consts.mjs';
import { LocalHookHandler, customGlobalHooks, localHooks } from './util/hooks.mjs';
import './handlebars-handlers/init.mjs';
import './util/item-hints.mjs';
import './bonuses.mjs';
import './patch/init.mjs';
import { FormulaCacheHelper, hasAnyBFlag } from './util/flag-helpers.mjs';
import { simplifyRollFormula } from './util/simplify-roll-formula.mjs';
import './auto-recognition/init.mjs';
import { api } from './util/api.mjs';
import migrate from './migration/index.mjs';
import { ifDebug } from './util/if-debug.mjs';
import { emptyObject } from './util/empty-object.mjs';
import { registerSetting } from './util/settings.mjs';
import { addNodeToRollBonus } from './handlebars-handlers/add-bonus-to-item-sheet.mjs';
import { localize } from './util/localize.mjs';
import './combat-bonuses/all-combat-bonuses.mjs';

Hooks.once('pf1PostReady', () => migrate());

/**
 * Alter the notes presented at the bottom of an attack card
 *
 * @param {() => any} wrapped
 * @this {ActionUse}
*/
function addFootnotes(wrapped) {
    wrapped();

    /** @type {string[]} */
    const notes = this.shared.templateData.footnotes ?? [];
    Hooks.call(customGlobalHooks.actionUseFootnotes, this, notes);
    this.shared.templateData.footnotes = notes;
}

/**
 * Alter the notes presented after an individual attack
 *
 * @param {() => Promise<void>} wrapped
 * @this {ChatAttack}
 */
async function setEffectNotesHTMLWrapper(wrapped) {
    await LocalHookHandler.fireHookNoReturnAsync(localHooks.chatAttackEffectNotes, this);
    await wrapped();
}

/**
 * Used to alter the roll. The roll can be inspected, then replaced.
 *
 * @this {ChatAttack}
 * @param {(args: any) => Promise<any>} wrapped
 * @param {object} obj
 * @param {boolean} [obj.noAttack]
 * @param {unknown} [obj.bonus]
 * @param {unknown[]} [obj.extraParts]
 * @param {boolean} [obj.critical] Whether or not this roll is a for a critical confirmation
 * @param {object} [obj.conditionalParts]
 */
async function chatAttackAddAttack(wrapped, { noAttack = false, bonus = null, extraParts = [], critical = false, conditionalParts = {} }) {
    await wrapped({ noAttack, bonus, extraParts, critical, conditionalParts });
    await LocalHookHandler.fireHookNoReturnAsync(localHooks.chatAttackAddAttack, this, { noAttack, bonus, extraParts, critical, conditionalParts });
}

/**
 * @param {*} wrapped
 * @param {*} options
 * @this {d20Roll}
 * @returns The result of the original method.
 */
function d20RollWrapper(wrapped, options = {}) {
    Hooks.call(customGlobalHooks.d20Roll, options);
    return wrapped.call(this, options);
}

/**
 * @this {ItemPF}
 * @param {*} wrapped
 * @param {boolean} final
 */
function prepareItemData(wrapped, final) {
    wrapped(final);

    if (!final) return;

    const item = this;
    item[MODULE_NAME] = emptyObject();
    const rollData = item.getRollData();
    FormulaCacheHelper.cacheFormulas(item, rollData);
    LocalHookHandler.fireHookNoReturnSync(localHooks.prepareData, item, rollData);
    ifDebug(() => {
        if (!foundry.utils.objectsEqual({ bonuses: [], targets: [] }, item[MODULE_NAME])) {
            console.debug(`Cached info for '${item.name}':`, item[MODULE_NAME]);
        }
    });
}

/**
 * @this {ActionUse}
 * @param {function({skipDialog: boolean}): Promise<void>} wrapped
 * @param {{skipDialog: boolean}} options
 */
async function actionUseProcess(wrapped, options) {
    LocalHookHandler.fireHookNoReturnSync(localHooks.actionUseProcess, this);
    return await wrapped(options);
}

/**
 * @this {ActionUse}
 * @param {(arg: object) => any} wrapped
 * @param {object} formData - The attack dialog's JQuery form data or FormData object
 */
function actionUseAlterRollData(wrapped, formData) {
    wrapped(formData);
    Hooks.call(customGlobalHooks.actionUseAlterRollData, this);
}

/**
 * @param {ActionUse} actionUse
 */
function onCreateActionUse(actionUse) {
    if (actionUse.shared.rollData.action) {
        // for modifying actionUse.shared.rollData before attacks are rolled
    }
}

/**
 * Used for adding conditionals to individual parts of full attacks
 *
 * @param {(arg: object, options: { index: number}) => any} wrapped
 * @param {object} atk - The attack used.
 * @param {object} options
 * @param {number} [options.index=0] - The index of the attack, in order of enabled attacks.
 * @returns {object} The conditional parts used.
 * @this {ActionUse}
 */
function getConditionalParts(wrapped, atk, { index = 0 }) {
    var result = wrapped(atk, { index });
    Hooks.call(customGlobalHooks.getConditionalParts, this, result, atk, index);
    return result;
}

/**
 * @param {()=> number} wrapped
 * @this {ItemAction}
 * @returns {number}
 */
function itemActionCritRangeWrapper(wrapped) {
    var current = wrapped();

    const result = LocalHookHandler.fireHookWithReturnSync(localHooks.itemActionCritRangeWrapper, current, this);
    return result;
}

/**
 * Determines conditional parts used in an attack.
 *
 * @param {() => {}} wrapped
 * @this {ActionUse}
 */
function actionUseHandleConditionals(wrapped) {
    wrapped();
    Hooks.call(customGlobalHooks.actionUseHandleConditionals, this);
}

/**
 * Add attack bonus to actor's Combat attacks column tooltip
 *
 * @param {(actionId: string) => any} wrapped
 * @param {string} actionId
 * @this {ItemPF}
 */
function itemGetAttackSources(wrapped, actionId) {
    const sources = wrapped(actionId);
    Hooks.call(customGlobalHooks.itemGetAttackSources, this, sources);
    return sources;
}

/**
 * Add info to chat card
 * @param {*} wrapped
 * @param {object} data
 * @param {Object<string, string>} labels
 * @param {string[]} props
 * @param {RollData} rollData
 * @this {ItemPF}
 */
function itemGetTypeChatData(wrapped, data, labels, props, rollData) {
    wrapped(data, labels, props, rollData);
    Hooks.call(customGlobalHooks.itemGetTypeChatData, this, props, rollData);
}

/**
 * Modify damage sources for actor's combat tooltips
 * @param {(fullId: string, context: { sources: Array<any>}) => void} wrapped
 * @param {string} fullId
 * @param {{sources: Array<any>}} context
 * @this {ActorSheetPF}
 */
function getDamageTooltipSources(wrapped, fullId, context) {
    wrapped(fullId, context);

    const re = /^(?<id>[\w-]+)(?:\.(?<detail>.*))?$/.exec(fullId);
    const { id, detail } = re?.groups ?? {};
    const [itemId, target] = detail?.split(".") ?? [];

    if (id === "item" && target === "damage") {
        const item = this.actor.items.get(itemId);
        /** @type {ItemChange[]} */
        const sources = [];
        Hooks.call(customGlobalHooks.getDamageTooltipSources, item, sources);
        if (sources.length) {
            context.sources ||= [];
            context.sources.push({ sources });
        }
    }

    // const filtered = getHighestChanges(sources, { ignoreTarget: true });
    // return filtered;
}

/**
 * @this {ItemAction}
 * @param {() => number} wrapped
 * @returns {number}
 */
function itemActionEnhancementBonus(wrapped) {
    const base = wrapped();
    const stacks = 0;
    const seed = { base, stacks };

    this[MODULE_NAME] ||= emptyObject();

    LocalHookHandler.fireHookWithReturnSync(localHooks.itemActionEnhancementBonus, seed, this);

    const total = seed.base + seed.stacks
    this[MODULE_NAME].enhancement = {
        base: seed.base,
        stacks: seed.stacks,
        total,
    };

    return total;
}

/**
 * Safely get the result of a roll, returns 0 if unsafe.
 * @param {string | number} formula - The string that should resolve to a number
 * @param {Nullable<RollData>} data - The roll data used for resolving any variables in the formula
 * @returns {number}
 */
function safeTotal(
    formula,
    data,
) {
    return (isNaN(+formula) ? RollPF.safeRollSync(formula, data).total : +formula) || 0;
}

/**
 * @param {() => any} wrapped
 * @this {ActorPF}
 */
function prepareActorDerivedData(wrapped) {
    wrapped();
    this[MODULE_NAME] ||= {};
    LocalHookHandler.fireHookNoReturnSync(localHooks.postPrepareActorDerivedData, this);
}

/**
 * @param {ActorPF | ItemPF | ItemAction} thing
 * @param {RollData} rollData
 */
function onItemActionRollData(thing, rollData) {
    // this fires for actor -> item -> action. If I handle more than one then it would double up bonuses. So I handle the root-most option
    if (thing instanceof pf1.components.ItemAction) {

        // set up base custom rolldata
        if (rollData.rangePenalty === undefined) {
            rollData.rangePenalty = {
                maxIncrements: rollData.action?.range?.maxIncrements ?? 10,
                units: rollData.action?.range?.units ?? 'ft',
                value: rollData.action?.range?.value ?? '0',
                rangePenalty: 2,
            };
        }

        const action = thing;
        // safety for initialization during data prep where the bonuses havent' been set up yet
        if (!action.item[MODULE_NAME]?.bonuses || !action.item[MODULE_NAME]?.targets) return;

        rollData[MODULE_NAME] ||= {};
        LocalHookHandler.fireHookNoReturnSync(localHooks.updateItemActionRollData, action, rollData);
    }
}

/**
 * @typedef {{data: RollData?, extraParts: unknown[], bonus:unknown, primaryAttack: boolean}} RollAttackArgs
 */ /**
* Place an attack roll using an item (weapon, feat, spell, or equipment)
*
* @this {ItemAction}
* @param {(arg: RollAttackArgs) => Promise<D20RollPF>} wrapped
* @param {object} [args]
* @param {RollData?} [args.data]
* @param {unknown[]} [args.extraParts]
* @param {unknown} [args.bonus]
* @param {boolean} [args.primaryAttack]
*/
async function itemActionRollAttack(
    wrapped,
    { data = null, extraParts = [], bonus = null, primaryAttack = true } = {}
) {
    const roll = await wrapped({ data, extraParts, bonus, primaryAttack });

    const formula = roll.formula;
    const options = roll.options;
    const rollData = roll.data;
    const seed = { formula, options };
    LocalHookHandler.fireHookNoReturnSync(localHooks.itemActionRollAttack, seed, this, rollData);

    if (formula !== seed.formula || !foundry.utils.objectsEqual(options, seed.options)) {
        const replaced = await new pf1.dice.D20RollPF(seed.formula, rollData, seed.options).evaluate();
        return replaced;
    }
    return roll;
}

/**
 * @param {(...arg: any[] ) => Promise<DamageRoll[]>} wrapped
 * @param {any[]} args
 * @this {ItemAction}
 */
async function itemActionRollDamage(wrapped, ...args) {
    const rolls = await wrapped(...args);
    let i = 0;
    for (const roll of rolls) {
        const formula = roll.formula;
        const options = roll.options;
        const rollData = roll.data;
        const seed = { formula, options };
        LocalHookHandler.fireHookNoReturnSync(localHooks.itemActionRollDamage, seed, this, rollData, i);

        if (formula !== seed.formula || !foundry.utils.objectsEqual(options, seed.options)) {
            const replaced = await new pf1.dice.DamageRoll(seed.formula, rollData, seed.options).evaluate();
            rolls[i] = replaced;
        }
        i++;
    }

    return rolls;
}

/**
 * @this {ActorPF}
 * @param {(skillId: keyof typeof pf1.config.skills, options: object) => ChatMessagePF|object|void} wrapped
 * @param {keyof typeof pf1.config.skills} skillId
 * @param {Object} options
 * @returns {ChatMessagePF|object|void} The chat message if one was created, or its data if not. `void` if the roll was cancelled.
 */
function actorRollSkill(wrapped, skillId, options) {
    const seed = { skillId, options };
    LocalHookHandler.fireHookNoReturnSync(localHooks.actorRollSkill, seed, this);
    return wrapped(seed.skillId, seed.options);
}

/**
 * @this {ActorPF}
 * @param {(skillId: string, options?: { rollData?: RollData }) => SkillInfo} wrapped
 * @param {keyof typeof pf1.config.skills} skillId
 * @param {object} [options]
 * @param {RollData} [options.rollData]
 * @return {SkillRollData}
 */
function actorGetSkillInfo(wrapped, skillId, { rollData } = {}) {
    rollData ||= this.getRollData();
    const skillInfo = wrapped(skillId, { rollData });
    LocalHookHandler.fireHookNoReturnSync(localHooks.actorGetSkillInfo, skillInfo, this, rollData);
    return skillInfo;
}

class ItemAttackFlagSettings {
    static key = 'should-copy-flags';

    /** @returns {boolean} */
    static get shouldCopyFlags() { return /** @type {boolean} */ (game.settings.get(MODULE_NAME, this.key)); }

    static {
        registerSetting({
            key: this.key,
            defaultValue: false,
            settingType: Boolean,
            scope: 'client',
        })
    }
}
/**
 * @param {function(ItemPF): any} wrapped
 * @param {ItemPF} item
 * @returns {any}
 */
function itemAttackFromItem(wrapped, item) {
    const data = wrapped(item);

    if (ItemAttackFlagSettings.shouldCopyFlags) {
        const systemFlags = item.system.flags;
        data.system.flags ||= {};
        data.system.flags = mergeObject(data.system.flags, systemFlags);

        if (item instanceof pf1.documents.item.ItemWeaponPF && item.system.properties.fin) {
            data.system.flags.boolean ||= {};
            data.system.flags.boolean['finesse-override'] = true;
        }

        const flags = item.flags?.[MODULE_NAME] || {};
        data.flags ||= {}
        data.flags[MODULE_NAME] = mergeObject(flags, data.flags[MODULE_NAME]);
    }

    return data;
}

Hooks.on('pf1CreateActionUse', onCreateActionUse);
Hooks.on('pf1GetRollData', onItemActionRollData);
Hooks.once('init', () => {
    // change.mjs also fires a local hook for re-calculating changes (e.g. Fate's Favored).

    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ActionUse.prototype._getConditionalParts', getConditionalParts, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ActionUse.prototype.addFootnotes', addFootnotes, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ActionUse.prototype.alterRollData', actionUseAlterRollData, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ActionUse.prototype.handleConditionals', actionUseHandleConditionals, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ActionUse.prototype.process', actionUseProcess, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ChatAttack.prototype.addAttack', chatAttackAddAttack, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ChatAttack.prototype.setEffectNotesHTML', setEffectNotesHTMLWrapper, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.applications.actor.ActorSheetPF.prototype._getTooltipContext', getDamageTooltipSources, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.components.ItemAction.prototype.critRange', itemActionCritRangeWrapper, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.components.ItemAction.prototype.enhancementBonus', itemActionEnhancementBonus, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.components.ItemAction.prototype.rollAttack', itemActionRollAttack, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.components.ItemAction.prototype.rollDamage', itemActionRollDamage, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.dice.d20Roll', d20RollWrapper, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.actor.ActorPF.prototype.getSkillInfo', actorGetSkillInfo, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.actor.ActorPF.prototype.prepareSpecificDerivedData', prepareActorDerivedData, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.actor.ActorPF.prototype.rollSkill', actorRollSkill, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.item.ItemAttackPF.fromItem', itemAttackFromItem, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.item.ItemPF.prototype._prepareDependentData', prepareItemData, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.item.ItemPF.prototype.getAttackSources', itemGetAttackSources, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.item.ItemPF.prototype.getTypeChatData', itemGetTypeChatData, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.item.ItemSpellPF.prototype.getTypeChatData', itemGetTypeChatData, libWrapper.WRAPPER);

    // for patching resources - both
    // libWrapper.register(MODULE_NAME, 'pf1.documents.item.ItemPF.prototype._updateMaxUses', updateMaxUses, libWrapper.WRAPPER);
    // pf1.documents.actor.ActorPF.prototype.updateItemResources

    RollPF.safeTotal = safeTotal;
    Object.defineProperty(
        RollPF.prototype,
        'simplifiedFormula',
        {
            /** @this {RollPF} */
            get: function () { return simplifyRollFormula(this.formula, { preserveFlavor: true }); }
        }
    );
    Object.defineProperty(
        RollPF.prototype,
        'isNumber',
        {
            /** @this {RollPF} */
            get: function () { return this.isDeterministic && !this.terms.every((x) => !!x.flavor); }
        }
    );

    console.log(`${FRIENDLY_MODULE_NAME} loaded`);
    game.modules.get(MODULE_NAME).api = api;
    game.modules.get(MODULE_NAME).ready = true;
    Hooks.callAll(`${MODULE_NAME}.ready`)
});

// specifically at end so it's registered last
Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const hasBonus = hasAnyBFlag(item, ...api.allBonusTypes.map((b) => b.key));
    const hasTarget = hasAnyBFlag(item, ...api.allTargetTypes.map((b) => b.key));

    /** @param {string} text */
    const label = (text) => {
        const div = document.createElement('div');
        div.innerHTML = `<div class="form-group roll-bonuses error settings"><label><a><i class="fas fa-circle-exclamation"></i> ${text} <i class="fas fa-sliders"></i></a></label></div>`;
        return div
    }

    if (hasBonus && !hasTarget) {
        addNodeToRollBonus(html, label(localize('hint-missing-target')), item, isEditable);
    }
    else if (!hasBonus && hasTarget) {
        addNodeToRollBonus(html, label(localize('hint-missing-bonus')), item, isEditable);
    }
});
// NOTHING BELOW THIS BLOCK
