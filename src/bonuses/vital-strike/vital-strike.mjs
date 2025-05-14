import { MODULE_NAME } from '../../consts.mjs';
import { checkboxInput } from '../../handlebars-handlers/bonus-inputs/chekbox-input.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { isWeapon } from '../../util/action-type-helpers.mjs';
import { api } from '../../util/api.mjs';
import { addCheckToAttackDialog, getFormData } from '../../util/attack-dialog-helper.mjs';
import { getCachedBonuses } from '../../util/get-cached-bonuses.mjs';
import { itemHasCompendiumId } from '../../util/has-compendium-id.mjs';
import { LocalHookHandler, localHooks } from '../../util/hooks.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { localize, localizeBonusLabel, localizeBonusTooltip } from '../../util/localize.mjs';
import { LanguageSettings } from '../../util/settings.mjs';
import { truthiness } from '../../util/truthiness.mjs';
import { SpecificBonus } from '../_specific-bonus.mjs';
import { DevastatingStrike, DevastatingStrikeImproved } from './devastating-strike.mjs';

/**
 * @typedef {Object} VSHintIcon
 * @property {string} icon
 * @property {''} multiplier
 *
 * @typedef {object} VSHintMultiplier
 * @property {undefined} [icon]
 * @property {string} multiplier
 *
 * @typedef {VSHintIcon | VSHintMultiplier} VSHintInfo
 */

const vitalStrikeEnabled = 'vital-strike-enabled';

class VitalBase extends SpecificBonus {

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#vital-strike'; }

    /** @type {ShowInputsFunc} */
    static showVitalStrikeInputs(item, html, isEditable) {
        showEnabledLabel({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'specific-bonus',
        });

        checkboxInput({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'specific-bonus',
            isSubLabel: true,
        });
    }
}

export class VitalStrike extends VitalBase {
    /** @inheritdoc @override */
    static get sourceKey() { return 'vital-strike'; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'DorPGQ2mifJbMKH8',
            isItemMatchFunc: (name) => name === Settings.name,
            showInputsFunc: this.showVitalStrikeInputs.bind(this),
        };
    }

    /** @type {VSHintInfo} */
    static get vsHintInfo() { return { multiplier: '×2' }; }
}
export class VitalStrikeImproved extends VitalBase {
    /** @inheritdoc @override */
    static get sourceKey() { return `${VitalStrike.sourceKey}-improved`; }

    /** @inheritdoc @override */
    static get parent() { return VitalStrike.key; }

    /** @inheritdoc @override */
    static get tooltip() { return VitalStrike.tooltip; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: '26k1Gi7t5BoqxhIj',
            isItemMatchFunc: (name) => LanguageSettings.isImproved(name, Settings.name),
            showInputsFunc: this.showVitalStrikeInputs.bind(this),
        };
    }

    /** @type {VSHintInfo} */
    static get vsHintInfo() { return { multiplier: '×3' }; }
}
export class VitalStrikeGreater extends VitalBase {
    /** @inheritdoc @override */
    static get sourceKey() { return `${VitalStrike.sourceKey}-greater`; }

    /** @inheritdoc @override */
    static get parent() { return VitalStrike.key; }

    /** @inheritdoc @override */
    static get tooltip() { return VitalStrike.tooltip; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'zKNk7a4XxXsygJ67',
            isItemMatchFunc: (name) => LanguageSettings.isGreater(name, Settings.name),
            showInputsFunc: this.showVitalStrikeInputs.bind(this),
        };
    }

    /** @type {VSHintInfo} */
    static get vsHintInfo() { return { multiplier: '×4' }; }
}
export class VitalStrikeMythic extends VitalBase {
    /** @inheritdoc @override */
    static get sourceKey() { return `${VitalStrike.sourceKey}-mythic`; }

    /** @inheritdoc @override */
    static get parent() { return VitalStrike.key; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'rYLOl3zfFt3by3CE',
            isItemMatchFunc: (name) => LanguageSettings.isMythic(name, Settings.name),
            showInputsFunc: (item, html, isEditable) => {
                showEnabledLabel({
                    item,
                    journal: this.key,
                    key: this.key,
                    parent: html,
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
        };
    }

    /** @type {VSHintInfo} */
    static get vsHintInfo() { return { multiplier: '', icon: 'ra ra-croc-sword' }; }
}

const allBonuses = /** @type {const} */ ([
    VitalStrike,
    VitalStrikeImproved,
    VitalStrikeGreater,
    VitalStrikeMythic,
]);

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const bonuses = allBonuses.filter((bonus) => bonus.has(item));
    if (!bonuses.length) {
        return;
    }

    return bonuses.map((bonus) =>
        hintcls.create(bonus.vsHintInfo.multiplier, [], { hint: bonus.tooltip, icon: bonus.vsHintInfo.icon })
    );
});

/**
 * @param {string} str
 * @returns {boolean}
 */
function hasPairedParens(str) {
    const left = (str.match(/\(/g) || []).length;
    const right = (str.match(/\)/g) || []).length;
    return left === right;
}

/**
 * @param {string} formula
 * @returns {string}
 */
const getFirstTermFormula = (formula) => {
    const roll = RollPF.create(formula);
    const terms = roll.terms;
    const operatorTerm = terms.slice(1).find(x => x instanceof OperatorTerm);
    if (!operatorTerm) return formula;

    const operatorFormula = operatorTerm.formula.trim();
    const potentials = formula.split(operatorFormula).filter(truthiness);

    let potential = '';
    for (const p of potentials) {
        potential += p;
        if (hasPairedParens(potential)) {
            if (terms[0] instanceof OperatorTerm && terms[0].formula.trim() === operatorFormula)
                return `${operatorFormula} ${potential}`;
            return potential;
        }
        potential += ` ${operatorFormula} `;
    }

    return formula;
}

class Settings {
    static get name() { return LanguageSettings.getTranslation(VitalStrike.key); }

    static {
        LanguageSettings.registerItemNameTranslation(VitalStrike.key);
    }
}

export class VitalStrikeData {
    /** @type {boolean} */
    get hasVitalStrike() { return !!this.key; }

    get isVital() { return this.key === VitalStrike.key; }
    get isImproved() { return this.key === VitalStrikeImproved.key; }
    get isGreater() { return this.key === VitalStrikeGreater.key; }

    /** @type {Nullable<ActionUse>} */
    actionUse;
    enabled = false;
    enabledByDefault = false;
    key = '';
    label = '';

    /** @type {ItemConditional[]} */
    conditionals = [];

    /**
     * @param {ActorPF} actor
     * @param {object} [options]
     * @param {ActionUse?} [options.actionUse]
     */
    constructor(actor, { actionUse = null } = {}) {
        this.actionUse = actionUse;
        this.hasDevastating = actor.hasItemBooleanFlag(DevastatingStrike.key);
        this.hasDevastatingImproved = actor.hasItemBooleanFlag(DevastatingStrikeImproved.key);
        this.mythic = this.#hasVitalStrikeMythic(actor);

        /**
         * @param {string} key
         * @param {number} amount
         * @returns {boolean} true if it has this type of strike
         */
        const setupVitalStrike = (key, amount) => {
            const vital = this.#getVitalStrikeData(actor, key);
            if (vital.has) {
                this.key = key;
                this.label = localizeBonusLabel(key);
                this.enabledByDefault = vital.enabled;
                this.multiplier = amount;

                if (actionUse?.shared.attacks.length !== 1) {
                    this.enabled = false;
                    return false;
                }

                if (actionUse) {
                    const part = actionUse.action.damage?.parts[0];
                    const partFormula = part?.formula || '';
                    const firstDice = getFirstTermFormula(partFormula);

                    if (firstDice) {
                        const formula =
                            this.isGreater ? `${firstDice}[${VitalStrike.key}] + ${firstDice}[${VitalStrikeImproved.label}] + ${firstDice}[${VitalStrikeGreater.key}]`
                                : this.isImproved ? `${firstDice}[${VitalStrike.key}] + ${firstDice}[${VitalStrikeImproved.key}]`
                                    : `${firstDice}[${VitalStrike.key}]`;

                        const formData = getFormData(actionUse, key);
                        this.enabled = typeof formData === 'boolean'
                            ? formData
                            : this.enabledByDefault;

                        {
                            const conditional = new pf1.components.ItemConditional({
                                default: true,
                                name: this.label,
                                modifiers: [{
                                    _id: foundry.utils.randomID(),
                                    critical: 'nonCrit',
                                    formula: formula,
                                    subTarget: 'attack_0',
                                    target: 'damage',
                                    type: '',
                                    damageType: [...part.types],
                                }],
                            });
                            this.conditionals.push(conditional);
                        }

                        if (this.hasDevastating) {
                            const conditional = new pf1.components.ItemConditional({
                                default: true,
                                name: localizeBonusLabel(DevastatingStrike.key),
                                modifiers: [{
                                    _id: foundry.utils.randomID(),
                                    critical: 'normal',
                                    formula: `${amount * 2}[${localizeBonusLabel(DevastatingStrike.key)}]`,
                                    subTarget: 'attack_0',
                                    target: 'damage',
                                    type: '',
                                    damageType: [...part.types],
                                }],
                            });
                            this.conditionals.push(conditional);
                        }

                        if (this.hasDevastatingImproved) {
                            const conditional = new pf1.components.ItemConditional({
                                default: true,
                                name: localizeBonusLabel(DevastatingStrikeImproved.key),
                                modifiers: [{
                                    _id: foundry.utils.randomID(),
                                    critical: 'crit',
                                    formula: `${amount * 2}[${localizeBonusLabel(DevastatingStrikeImproved.key)}]`,
                                    subTarget: 'attack_0',
                                    target: 'attack',
                                    type: '',
                                    damageType: [...part.types],
                                }],
                            });
                            this.conditionals.push(conditional);
                        }
                    }
                }
                return true;
            }

            return false;
        }

        // simple hack for making sure the best is handled and not the remaining
        setupVitalStrike(VitalStrikeGreater.key, 3)
            || setupVitalStrike(VitalStrikeImproved.key, 2)
            || setupVitalStrike(VitalStrike.key, 1);
    }

    /**
     * @param {ItemConditional[]} conditionals
     * @returns {ItemConditional | undefined}
     */
    buildMythicConditional(conditionals) {
        if (!this.enabled || !this.mythic || !this.actionUse) {
            return;
        };

        const formulaParts = [];

        /**
         * @param {string | number} f
         * @param {string?} [l]
         * @returns {string}
        */
        const toFormula = (f, l) => `{${new Array(this.multiplier).fill(f).join(', ')}}${(l ? `[${l}]` : '')}`;

        // this.action.allDamageSources
        formulaParts.push(...this.actionUse.action.allDamageSources.map(x => toFormula(x.formula, x.flavor)));

        // and ability source
        const abl = this.actionUse.shared.rollData.action?.ability.damage;
        const ability = abl && this.actionUse.shared.rollData.abilities?.[abl];
        if (ability) {
            const isNatural = this.actionUse.shared.rollData.item.subType === "natural";
            const held = this.actionUse.shared.rollData.action?.held || '1h';
            const ablMult =
                this.actionUse.shared.rollData.action?.ability.damageMult ?? (isNatural ? null : pf1.config.abilityDamageHeldMultipliers[held]) ?? 1;
            // Determine ability score bonus
            const max = this.actionUse.action.ability?.max ?? Infinity;
            const ablDamage = (ability.mod < 0)
                ? Math.min(max, ability.mod)
                : Math.floor(Math.min(max, ability.mod) * ablMult);

            if (ablDamage) {
                formulaParts.push(toFormula(ablDamage, pf1.config.abilities[abl]));
            }
        }

        // this.actionUse.shared.damageBonus
        formulaParts.push(...this.actionUse.shared.damageBonus.map(x => toFormula(x)));

        // filter all conditions // conditions.where target = damage and critial = normal
        formulaParts.push(...conditionals
            .filter(truthiness)
            .flatMap((c) => [...c.modifiers])
            .filter((m) => m.target === 'damage' && m.critical === 'normal')
            .map((m) => toFormula(m.formula))
        );

        if (this.actionUse.shared.rollData.powerAttackBonus) {
            const label = ["rwak", "twak", "rsak"].includes(this.actionUse.shared.action.actionType)
                ? localize("PF1.DeadlyAim")
                : localize("PF1.PowerAttack");
            formulaParts.push(toFormula(this.actionUse.shared.rollData.powerAttackBonus, label));
        }

        if (!formulaParts.length) {
            return;
        }

        const conditional = new pf1.components.ItemConditional({
            default: true,
            name: VitalStrikeMythic.label,
            modifiers: [{
                _id: foundry.utils.randomID(),
                critical: 'nonCrit',
                formula: `{${formulaParts.join(', ')}}[${VitalStrikeMythic.label}]`,
                subTarget: 'attack_0',
                target: 'damage',
                type: '',
                damageType: [...this.actionUse.action.damage?.parts[0]?.types],
            }],
        });

        return conditional;
    }

    /** @param {ActorPF} actor @param {string} key @returns {{ has: boolean, enabled: boolean }} */
    #getVitalStrikeData = (actor, key) => {
        var items = getCachedBonuses(actor, key);
        var enabledByDefault = !!items.find(x => !!x.getFlag(MODULE_NAME, vitalStrikeEnabled));
        return { has: !!items.length, enabled: enabledByDefault };
    }
    /** @param {ActorPF} actor * @returns {boolean} */
    #hasVitalStrikeMythic = (actor) => VitalStrikeMythic.has(actor);
}
api.utils.VitalStrikeData = VitalStrikeData;

/**
 * @this {ActionUse}
 * @param {AttackDialog} dialog
 * @param {[HTMLElement]} html
 * @param {AttackDialogData} data
 */
function addConditionalModifierToDialog(dialog, [html], data) {
    if (!(dialog instanceof pf1.applications.AttackDialog)) {
        return;
    }

    if (!isWeapon(dialog.action?.item, dialog.action)) {
        return;
    }

    const actor = dialog.action.actor;
    if (!actor) {
        return;
    }

    const vital = new VitalStrikeData(actor);
    if (vital.hasVitalStrike) {
        addCheckToAttackDialog(
            html,
            vital.key,
            dialog,
            {
                checked: vital.enabledByDefault,
                label: localizeBonusLabel(vital.key),
            }
        );
    }
}
Hooks.on('renderApplication', addConditionalModifierToDialog);

/**
 * Adds conditional to action being used
 *
 * @param {ActionUse} actionUse
 * @param {ItemConditional[]} conditionals
 */
function actionUseHandleConditionals(actionUse, conditionals) {
    if (!isWeapon(actionUse?.item, actionUse.action)) {
        return;
    }

    if (actionUse.shared.attacks.length !== 1) {
        return;
    }

    const vital = new VitalStrikeData(actionUse.actor, { actionUse });
    if (!vital.hasVitalStrike || !vital.enabled) return;

    conditionals.push(...vital.conditionals);
}
LocalHookHandler.registerHandler(localHooks.actionUse_handleConditionals, actionUseHandleConditionals);
