import { FRIENDLY_MODULE_NAME, MODULE_NAME } from './consts.mjs';
import { LocalHookHandler, customGlobalHooks, localHooks } from './util/hooks.mjs';
import './handlebars-handlers/init.mjs';
import './util/item-hints.mjs';
import './_all-bonuses.mjs';
import './patch/init.mjs';
import { FormulaCacheHelper } from './util/flag-helpers.mjs';
import { simplify, simplifyRollFormula } from './util/simplify-roll-formula.mjs';
import './auto-recognition/init.mjs';
import { api } from './util/api.mjs';
import migrate from './migration/index.mjs';
import { ifDebug } from './util/if-debug.mjs';
import { emptyObject } from './util/empty-object.mjs';
import { registerSetting } from './util/settings.mjs';
import { addNodeToRollBonus } from './handlebars-handlers/add-bonus-to-item-sheet.mjs';
import { localize, localizeBonusLabel } from './util/localize.mjs';
import { FinesseOverride } from './targeted/target-overides/finesse-override.mjs';
import { handleConditionals } from './patch/action-use_handle-conditionals.mjs';
import { truthiness } from './util/truthiness.mjs';

Hooks.once('pf1PostReady', () => migrate());

/**
 * Alter the notes presented at the bottom of an attack card
 *
 * @param {() => any} wrapped
 * @this {ActionUse}
*/
async function addFootnotes(wrapped) {
    await wrapped();

    const notes = this.shared.templateData.footnotes ?? [];
    LocalHookHandler.fireHookNoReturnSync(localHooks.actionUseFootnotes, this, notes)
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
 * @param {string[]} [obj.extraParts]
 * @param {boolean} [obj.critical] Whether or not this roll is a for a critical confirmation
 * @param {object} [obj.conditionalParts]
 */
async function chatAttackAddAttack(wrapped, { noAttack = false, bonus = null, extraParts = [], critical = false, conditionalParts = {} }) {
    await LocalHookHandler.fireHookNoReturnAsync(localHooks.preRollChatAttackAddAttack, this, { noAttack, bonus, extraParts, critical, conditionalParts });
    await wrapped({ noAttack, bonus, extraParts, critical, conditionalParts });
    await LocalHookHandler.fireHookNoReturnAsync(localHooks.chatAttackAddAttack, this, { noAttack, bonus, extraParts, critical, conditionalParts });
}

/**
 * @param {*} wrapped
 * @param {*} options
 * @this {d20Roll}
 * @returns The result of the original method.
 */
async function async_d20RollWrapper(wrapped, options = {}) {
    Hooks.call(customGlobalHooks.d20Roll, options);
    return await wrapped(options);
}

// function preAttackRoll(action, config, rollData, rollOptions, parts, changes) {
//     changes.push(...[
//         createChangeForTooltip({
//             name: 'test 50',
//             type: 'alchemical',
//             value: 50,
//             subTarget: 'attack',
//         }),
//         createChangeForTooltip({
//             name: 'test 60',
//             type: 'alchemical',
//             value: 60,
//             subTarget: 'attack',
//         }),
//         createChangeForTooltip({
//             name: 'test 40',
//             type: 'alchemical',
//             value: 40,
//             subTarget: 'attack',
//         }),
//     ]);
//     debugger;
// }
// Hooks.on("pf1PreAttackRoll", preAttackRoll);
// function preDamageRoll(action, rollData, parts, changes) {
//     changes.push(...[
//         createChangeForTooltip({
//             name: 'test 55',
//             type: 'alchemical',
//             value: 55,
//             subTarget: 'damage',
//         }),
//         createChangeForTooltip({
//             name: 'test 65',
//             type: 'alchemical',
//             value: 65,
//             subTarget: 'damage',
//         }),
//         createChangeForTooltip({
//             name: 'test 45',
//             type: 'alchemical',
//             value: 45,
//             subTarget: 'damage',
//         }),
//     ]);
//     debugger;
// }
// Hooks.on('pf1PreDamageRoll', preDamageRoll);

/**
 * @this {ActorPF}
 * @param {() => any} wrapped
 */
function actor_prepareEmbeddedDocuments(wrapped) {
    this.items.forEach((item) => {
        item.system.flags ||= { boolean: {}, dictionary: {} };
        item.system.flags.boolean ||= {};
    });

    wrapped();
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
    item.actions.forEach((action) => action[MODULE_NAME] = emptyObject());

    const rollData = item.getRollData();
    FormulaCacheHelper.cacheFormulas(item, rollData);
    LocalHookHandler.fireHookNoReturnSync(localHooks.prepareData, item, rollData);

    // cache range so it can be used within the getRollData hook
    item.actions.forEach((action) => {
        const rd = action.getRollData();
        action[MODULE_NAME] ||= {};
        action[MODULE_NAME].range ||= {};
        action[MODULE_NAME].range.min = action.getRange({ type: 'min', rollData: rd });
        action[MODULE_NAME].range.max = action.getRange({ type: 'max', rollData: rd });
        action[MODULE_NAME].range.single = action.getRange({ type: 'single', rollData: rd });
    })

    ifDebug(() => {
        if (!foundry.utils.objectsEqual(
            { bonuses: [], targets: [] },
            { bonuses: item[MODULE_NAME].bonuses, targets: item[MODULE_NAME].targets },
        )) {
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
 * @param {(arg: object) => Promise<void>} wrapped
 * @param {object} formData - The attack dialog's JQuery form data or FormData object
 */
async function actionUseAlterRollData(wrapped, formData) {
    await wrapped(formData);
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
 * @this {ActionUse}
 */
async function actionUse_handleConditionals() {
    // shared.conditionals is an array of indexes to grab the conditional data for
    this.shared.conditionals ||= [];

    /** @type {ItemConditional[]} */
    const conditionals = [];
    LocalHookHandler.fireHookNoReturnSync(localHooks.actionUse_handleConditionals, this, conditionals);

    const BaneBonus = api.bonusTypeMap['bonus_bane'];
    const baneProvider = BaneBonus.actionHasBaneTarget(this.action);
    if (baneProvider) {
        const label = BaneBonus.getLabelForTargetsFromSource(baneProvider) || localizeBonusLabel(BaneBonus.key);

        const bane = new pf1.components.ItemConditional({
            default: true,
            name: localizeBonusLabel('bonus_bane'),
            modifiers: [{
                _id: foundry.utils.randomID(),
                critical: 'nonCrit',
                damageType: ['untyped'],
                formula: `2d6[${label}]`,
                subTarget: 'allDamage',
                target: 'damage',
            }],
        });
        conditionals.push(bane);
    }

    const actionConditionals = this.shared.conditionals.map((id) => this.shared.action.conditionals.get(id))
    const conditionalData = [
        ...actionConditionals,
        ...conditionals,
    ].filter(truthiness);

    // spells/abilities that don't have attack rolls still need to accept "nonCrit" bonuses
    // the system is hardcoded to only look at "normal" damage when no attack roll is configured
    if (!this.action.hasAttack && this.action.hasDamage) {
        conditionalData.forEach((c) => {
            c.modifiers.forEach(m => {
                if (m.critical === 'nonCrit') {
                    m.critical = 'normal';
                }
            });
        });
    }

    // This needs to happen after all other conditionals have been gathered so it can double any extra
    // excluding default conditionals because those are already included in action's damage sources
    const vital = new api.utils.VitalStrikeData(this.actor, { actionUse: this });
    if (vital.enabled) {
        const mythic = vital.buildMythicConditional([
            ...conditionals,
            ...actionConditionals
                .filter(truthiness)
                .filter(x => !x.default),
        ]);
        if (mythic) {
            conditionalData.push(mythic);
        }
    }

    await handleConditionals(this, conditionalData);
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
 * @param {(fullId: string, context: { sources: Array<any>}) => Promise<void>} wrapped
 * @param {string} fullId
 * @param {{sources: Array<any>}} context
 * @this {ActorSheetPF}
 * @returns {Promise<void>}
 */
async function getDamageTooltipSources(wrapped, fullId, context) {
    await wrapped(fullId, context);

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
 * @param {() => ItemChange[]} wrapped
 */
function itemAction_damageSources(wrapped) {
    const damageSources = wrapped() || [];
    LocalHookHandler.fireHookNoReturnSync(localHooks.itemAction_damageSources, this, damageSources);
    return damageSources;
};

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

    const hasBane = api.bonusTypeMap['bonus_bane'].actionHasBaneTarget(this);
    if (hasBane) {
        seed.stacks += 2;
    }

    const total = seed.base + seed.stacks
    this[MODULE_NAME].enhancement = {
        base: seed.base,
        stacks: seed.stacks,
        total,
    };

    return total;
}

/**
 * @this {ItemAction}
 * @param {(args: { rollData?: RollData, isolated?: boolean }) => Record<string, string>} wrapped
 * @param {object} [options]
 * @param {boolean} [options.isolated] - Are these labels generated for isolated information (that is, need more details)
 * @param {RollData} [options.rollData] - Pre-determined roll data. If not provided, finds the action's own roll data.
 * @returns {Record<string, string>} This action's labels
 */
function itemAction_getLabels(wrapped, { rollData, isolated = false } = {}) {
    const labels = wrapped({ rollData, isolated });

    // has been previously calculated if conditionals are already included
    const shouldSkip = !!rollData?.conditionals;

    if (this.hasSave && rollData && !shouldSkip) {
        const seed = { dc: 0 };
        LocalHookHandler.fireHookNoReturnSync(localHooks.modifyActionLabelDC, this, seed);
        const totalDC = rollData.dc + (rollData.dcBonus ?? 0) + seed.dc;
        labels.save = game.i18n.format("PF1.DCThreshold", { threshold: totalDC });
    }

    return labels;
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
    return (isNaN(+formula) ? RollPF.create(formula + '', data).evaluateSync({ forceSync: true }).total : +formula) || 0;
}

/**
 * @param {ActorPF | ItemPF | ItemAction} thing
 * @param {RollData} rollData
 */
function onGetRollData(thing, rollData) {
    // this fires for actor -> item -> action. If I handle more than one then it would double up bonuses. So I handle the root-most option
    if (thing instanceof pf1.components.ItemAction) {
        const action = thing;

        rollData.rb ||= {};
        LocalHookHandler.fireHookNoReturnSync(localHooks.initItemActionRollData, action, rollData);

        // safety for initialization during data prep where the bonuses havent' been set up yet
        if (!action.item[MODULE_NAME]?.bonuses || !action.item[MODULE_NAME]?.targets) return;

        rollData[MODULE_NAME] ||= {};
        LocalHookHandler.fireHookNoReturnSync(localHooks.updateItemActionRollData, action, rollData);
    }
}

/**
 * @typedef {{data: RollData?, extraParts: unknown[], bonus:unknown, primary: boolean, extraChanges: ItemChange[]}} RollAttackArgs
 */ /**
* Place an attack roll using an item (weapon, feat, spell, or equipment)
*
* @this {ItemAction}
* @param {(arg: RollAttackArgs) => Promise<D20RollPF>} wrapped
* @param {object} [args]
* @param {RollData?} [args.data]
* @param {unknown[]} [args.extraParts]
* @param {ItemChange[]} [args.extraChanges] - Additional changes
* @param {unknown} [args.bonus]
* @param {boolean} [args.primary]
*/
async function itemAction_RollAttack(
    wrapped,
    { data = null, extraParts = [], extraChanges = [], bonus = null, primary = true } = {}
) {
    data ||= null;
    extraParts ||= [];
    extraChanges ||= [];
    bonus ||= null;
    if (primary !== false) primary = true;

    const roll = await wrapped({ data, extraParts, bonus, primary, extraChanges });

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
        const options = { ...roll.options };
        const rollData = roll.data;
        const seed = { formula, options };
        LocalHookHandler.fireHookNoReturnSync(localHooks.itemActionRollDamage, seed, this, rollData, i);

        if (formula !== seed.formula || !foundry.utils.objectsEqual(roll.options, seed.options)) {
            const replaced = await new pf1.dice.DamageRoll(seed.formula, rollData, seed.options)
                .evaluate({ maximize: !!seed.options.maximize, minimize: !!seed.options.minimize });
            rolls[i] = replaced;
        }
        i++;
    }

    return rolls;
}

/**
 * @this {ActorPF}
 * @param {(skillId: SkillId, options: object) => Promise<ChatMessagePF|object|void>} wrapped
 * @param {SkillId} skillId
 * @param {Object} options
 * @returns {Promise<ChatMessagePF|object|void>} The chat message if one was created, or its data if not. `void` if the roll was cancelled.
 */
async function actorRollSkill(wrapped, skillId, options) {
    const extraChanges = LocalHookHandler.fireHookWithReturnSync(localHooks.getActorSkillChanges, [], this, skillId);
    this.changes ||= new Collection();
    extraChanges.forEach((c) => this.changes?.set(c.id, c))

    const seed = { skillId, options };
    LocalHookHandler.fireHookNoReturnSync(localHooks.actorRollSkill, seed, this);
    const result = await wrapped(seed.skillId, seed.options);

    // remove those extra changes
    extraChanges.forEach((c) => this.changes?.delete(c.id));

    return result;
}

/**
 * @this {ActorPF}
 * @param {(id: SavingThrow, options: object) => Promise<ChatMessagePF|object|void>} wrapped
 * @param {*} savingThrowId
 * @param {*} options
 */
async function actorRollSavingThrow(wrapped, savingThrowId, options = {}) {
    const extraChanges = LocalHookHandler.fireHookWithReturnSync(localHooks.getActorSaveChanges, [], this, savingThrowId);
    this.changes ||= new Collection();
    extraChanges.forEach((c) => this.changes?.set(c.id, c))

    const result = await wrapped(savingThrowId, options);

    // remove those extra changes
    extraChanges.forEach((c) => this.changes?.delete(c.id));

    return result;
}

/**
 * @this {ActorPF}
 * @param {(skillId: string, options?: { rollData?: RollData }) => SkillInfo} wrapped
 * @param {SkillId} skillId
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
            data.system.flags.boolean[FinesseOverride.key] = true;
        }

        const flags = item.flags?.[MODULE_NAME] || {};
        data.flags ||= {}
        data.flags[MODULE_NAME] = mergeObject(flags, data.flags[MODULE_NAME]);
    }

    return data;
}

/**
 * @param {ActorSheetPF} actorSheet
 * @param {string} identifier
 * @param {HTMLTemplateElement} template
 */
function onRenderPF1ExtendedTooltip(actorSheet, identifier, template) {
    const [itemType, id, type] = identifier.split('.');
    if (itemType === 'item' && type === 'damage') {
        const item = actorSheet.actor.items.get(id);
        const action = item?.defaultAction;
        if (!action) return;

        const conditionals = action[MODULE_NAME]?.conditionals || [];
        if (!conditionals.length) return;

        if (!template.content.textContent?.includes('sizeRoll')) return;

        const rd = foundry.utils.deepClone(action.getRollData());
        if (rd.size && isNaN(rd.size)) return;

        const sizeBonus = conditionals
            .filter((x) => x.target === 'size')
            .map((x) => RollPF.safeTotal(x.formula))
            .reduce((acc, x) => acc + x, 0);

        if (!sizeBonus) return;
        rd.size = (rd.size || 0) + sizeBonus;

        const children = Array.from(template.content.childNodes).filter(x => !(x instanceof Text));

        let nextFormulaReplacement = '';
        for (const child of children) {
            if (!(child instanceof HTMLElement)) continue;

            if (nextFormulaReplacement) {
                // child.innerText = child.innerText.replace(/\d+d\d+/, nextFormulaReplacement);
                child.innerText = nextFormulaReplacement;
            }
            if (child.innerText.includes('sizeRoll')) {
                const formula = child.innerText;
                nextFormulaReplacement = simplify(formula, rd);
            }
            else {
                nextFormulaReplacement = '';
            }
        }
    }
}

Hooks.on('pf1CreateActionUse', onCreateActionUse);
Hooks.on('pf1GetRollData', onGetRollData);
Hooks.on('renderPF1ExtendedTooltip', onRenderPF1ExtendedTooltip);
Hooks.once('init', () => {
    libWrapper.register(MODULE_NAME, 'pf1.documents.actor.ActorBasePF.prototype.prepareEmbeddedDocuments', actor_prepareEmbeddedDocuments, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.item.ItemPF.prototype._prepareDependentData', prepareItemData, libWrapper.WRAPPER);

    // change.mjs also fires a local hook for re-calculating changes (e.g. Fate's Favored).
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ActionUse.prototype._getConditionalParts', getConditionalParts, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ActionUse.prototype.addFootnotes', addFootnotes, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ActionUse.prototype.alterRollData', actionUseAlterRollData, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ActionUse.prototype.handleConditionals', actionUse_handleConditionals, libWrapper.OVERRIDE);
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ActionUse.prototype.process', actionUseProcess, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ChatAttack.prototype.addAttack', chatAttackAddAttack, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ChatAttack.prototype.setEffectNotesHTML', setEffectNotesHTMLWrapper, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.applications.actor.ActorSheetPF.prototype._getTooltipContext', getDamageTooltipSources, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.components.ItemAction.prototype.critRange', itemActionCritRangeWrapper, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.components.ItemAction.prototype.damageSources', itemAction_damageSources, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.components.ItemAction.prototype.enhancementBonus', itemActionEnhancementBonus, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.components.ItemAction.prototype.getLabels', itemAction_getLabels, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.components.ItemAction.prototype.rollAttack', itemAction_RollAttack, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.components.ItemAction.prototype.rollDamage', itemActionRollDamage, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.dice.d20Roll', async_d20RollWrapper, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.actor.ActorPF.prototype.getSkillInfo', actorGetSkillInfo, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.actor.ActorPF.prototype.rollSkill', actorRollSkill, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.actor.ActorPF.prototype.rollSavingThrow', actorRollSavingThrow, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'pf1.documents.item.ItemAttackPF.fromItem', itemAttackFromItem, libWrapper.WRAPPER);
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
    Hooks.callAll(`${MODULE_NAME}.ready`, api);
});

/**
 * Whether or not the document has any of the given boolean flags
 *
 * @param {Nullable<ItemPF>} doc
 * @param  {...string} flags
 * @returns {boolean} True if the actor has any of the boolean flags.
 */
const hasAnyBFlag = (
    doc,
    ...flags
) => {
    if (!doc) return false;

    if (doc instanceof pf1.documents.item.ItemPF) {
        return flags.some((flag) => doc.hasItemBooleanFlag(flag));
    }

    return false;
}

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
        addNodeToRollBonus(html, label(localize('hint-missing-target')), item, isEditable, 'target');
    }
    else if (!hasBonus && hasTarget) {
        addNodeToRollBonus(html, label(localize('hint-missing-bonus')), item, isEditable, 'bonus');
    }
});
// NOTHING BELOW THIS BLOCK
