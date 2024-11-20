import { MODULE_NAME } from '../consts.mjs';
import { checkboxInput } from '../handlebars-handlers/bonus-inputs/chekbox-input.mjs';
import { showEnabledLabel } from '../handlebars-handlers/enabled-label.mjs';
import { isWeapon } from '../util/action-type-helpers.mjs';
import { addCheckToAttackDialog, getFormData } from '../util/attack-dialog-helper.mjs';
import { getCachedBonuses } from '../util/get-cached-bonuses.mjs';
import { LocalHookHandler, localHooks } from '../util/hooks.mjs';
import { registerItemHint } from '../util/item-hints.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../util/localize.mjs';
import { LanguageSettings } from '../util/settings.mjs';
import { truthiness } from '../util/truthiness.mjs';
import { SpecificBonuses } from './all-specific-bonuses.mjs';


const vitalStrike = 'vital-strike';
const vitalStrikeImproved = 'vital-strike-improved';
const vitalStrikeGreater = 'vital-strike-greater';
const vitalStrikeMythic = 'vital-strike-mythic';

const vitalStrikeCompendiumId = '26k1Gi7t5BoqxhIj';
const vitalStrikeImprovedCompendiumId = 'DorPGQ2mifJbMKH8';
const vitalStrikeGreaterCompendiumId = 'zKNk7a4XxXsygJ67';
const vitalStrikeMythicCompendiumId = 'rYLOl3zfFt3by3CE';

const vitalStrikeEnabled = 'vital-strike-enabled';

const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#vital-strike';

SpecificBonuses.registerSpecificBonus({ journal, key: vitalStrike });
SpecificBonuses.registerSpecificBonus({ journal, key: vitalStrikeImproved, parent: vitalStrike, tooltipKey: vitalStrike });
SpecificBonuses.registerSpecificBonus({ journal, key: vitalStrikeGreater, parent: vitalStrike, tooltipKey: vitalStrike });
// SpecificBonuses.registerSpecificBonus({ journal, key: vitalStrikeMythic, parent: vitalStrike });

const hintInfo = /** @type {const} */ ({
    [vitalStrike]: { label: '×2', tooltipKey: vitalStrike, icon: undefined },
    [vitalStrikeImproved]: { label: '×3', tooltipKey: vitalStrike, icon: undefined },
    [vitalStrikeGreater]: { label: '×4', tooltipKey: vitalStrike, icon: undefined },
    // [vitalStrikeMythic]: { label: '', tooltipKey: vitalStrikeMythic, icon: 'ra ra-croc-sword' },
});
const allKeys = /** @type {const} */ ([
    vitalStrike,
    vitalStrikeImproved,
    vitalStrikeGreater,
    // vitalStrikeMythic,
]);

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const keys = allKeys.filter((k) => !!item.hasItemBooleanFlag(k));
    if (!keys.length) {
        return;
    }

    return keys.map((k) => {
        const info = hintInfo[k];
        return hintcls.create(info.label, [], { hint: localizeBonusTooltip(info.tooltipKey), icon: info.icon });
    });
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
    static get vitalStrike() { return LanguageSettings.getTranslation(vitalStrike); }

    static {
        LanguageSettings.registerItemNameTranslation(vitalStrike);
    }
}

class VitalStrikeData {
    /** @type {boolean} */
    get hasVitalStrike() { return !!this.key; }

    get isVital() { return this.key === vitalStrike; }
    get isImproved() { return this.key === vitalStrikeImproved; }
    get isGreater() { return this.key === vitalStrikeGreater; }

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

        // this.mythic = this.#hasVitalStrikeMythic(actor);

        /**
         * @param {string} key
         * @param {number} amount
         * @returns {boolean} true if it has this type of strike
         */
        const setupVitalStrike = (key, amount) => {
            const vital = this.#hasVitalStrike(actor, key);
            if (vital.has) {
                this.key = key;
                this.label = localizeBonusLabel(key);
                this.enabledByDefault = vital.enabled;

                if (actionUse) {
                    // if (!this.mythic) {
                    const part = actionUse.action.data.damage?.parts[0];
                    const partFormula = part.formula || '';
                    const firstDice = getFirstTermFormula(partFormula);

                    if (firstDice) {
                        const formula =
                            this.isGreater ? `${firstDice}[${localizeBonusLabel(vitalStrike)}] + ${firstDice}[${localizeBonusLabel(vitalStrikeImproved)}] + ${firstDice}[${localizeBonusLabel(vitalStrikeGreater)}]`
                                : this.isImproved ? `${firstDice}[${localizeBonusLabel(vitalStrike)}] + ${firstDice}[${localizeBonusLabel(vitalStrikeImproved)}]`
                                    : `${firstDice}[${localizeBonusLabel(vitalStrike)}]`;

                        const formData = getFormData(actionUse, key);
                        this.enabled = typeof formData === 'boolean'
                            ? formData
                            : this.enabledByDefault;
                        var conditional = new pf1.components.ItemConditional({
                            _id: foundry.utils.randomID(),
                            default: true,
                            name: this.label,
                            modifiers: [{
                                ...pf1.components.ItemConditionalModifier.defaultData,
                                _id: foundry.utils.randomID(),
                                critical: 'nonCrit',
                                formula: formula,
                                subTarget: 'attack_0',
                                target: 'damage',
                                type: '',
                                damageType: part.type,
                            }],
                        });
                        this.conditionals.push(conditional);
                    }
                }
                return true;
            }

            return false;
        }

        // simple hack for making sure the best is handled and not the remaining
        setupVitalStrike(vitalStrikeGreater, 3)
            || setupVitalStrike(vitalStrikeImproved, 2)
            || setupVitalStrike(vitalStrike, 1);
    }

    /** @param {ActorPF} actor @param {string} key @returns {{ has: boolean, enabled: boolean }} */
    #hasVitalStrike = (actor, key) => {
        var items = getCachedBonuses(actor, key);
        var enabledByDefault = !!items.find(x => !!x.getFlag(MODULE_NAME, vitalStrikeEnabled));
        return { has: !!items.length, enabled: enabledByDefault };
    }
    /** @param {ActorPF} actor * @returns {boolean} */
    #hasVitalStrikeMythic = (actor) => actor.hasItemBooleanFlag(vitalStrikeMythic);
}

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

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    configureIfNecesary(item);

    const isVital = item.hasItemBooleanFlag(vitalStrike);
    const isImproved = item.hasItemBooleanFlag(vitalStrikeImproved);
    const isGreater = item.hasItemBooleanFlag(vitalStrikeGreater);
    const isMythic = item.hasItemBooleanFlag(vitalStrikeMythic);

    /**
     * @param {string} key
     * @param {string} [tooltip]
     */
    const showVitalStrike = (key, tooltip) => {
        showEnabledLabel({
            item,
            journal,
            key,
            parent: html,
            tooltip: localizeBonusTooltip(tooltip || vitalStrike),
        }, {
            canEdit: isEditable,
            inputType: 'specific-bonus',
        });
    }
    vitalStrikeEnabled

    if (isGreater) {
        showVitalStrike(vitalStrikeGreater);
    }
    if (isImproved) {
        showVitalStrike(vitalStrikeImproved);
    }
    if (isVital) {
        showVitalStrike(vitalStrike);
    }
    // if (isMythic) {
    //     showVitalStrike(vitalStrikeMythic, vitalStrikeMythic);
    // }

    if (isVital || isImproved || isGreater) {
        checkboxInput({
            item,
            journal,
            key: vitalStrikeEnabled,
            parent: html,
        }, {
            canEdit: isEditable,
            inputType: 'specific-bonus',
            isSubLabel: true,
        });
    }
});

/**
 * @param {ItemPF} item
 * @param {object} data
 * @param {{temporary: boolean}} param2
 * @param {string} id
 */
const onCreate = (item, data, { temporary }, id) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;
    if (temporary) return;

    configureIfNecesary(item, { onCreate: true })
}
Hooks.on('preCreateItem', onCreate);

/**
 * @param {ItemPF} item
 * @param {object} [options]
 * @param {boolean} [options.onCreate]
 */
const configureIfNecesary = (item, { onCreate = false } = {}) => {
    const name = item?.name?.toLowerCase() ?? '';
    const sourceId = item?.flags.core?.sourceId ?? '';
    const isRegular = name === Settings.vitalStrike
        || sourceId.includes(vitalStrikeCompendiumId);
    const isImproved = (name.includes(Settings.vitalStrike) && name.includes(LanguageSettings.improved))
        || sourceId.includes(vitalStrikeImprovedCompendiumId);
    const isGreater = (name.includes(Settings.vitalStrike) && name.includes(LanguageSettings.greater))
        || sourceId.includes(vitalStrikeGreaterCompendiumId);
    const isMythic = (name.includes(Settings.vitalStrike) && name.includes(LanguageSettings.mythic))
        || sourceId.includes(vitalStrikeMythicCompendiumId);

    const addFlag = (/** @type {string} */flag) =>
        onCreate
            ? item.updateSource({ [`system.flags.boolean.${flag}`]: true })
            : item.addItemBooleanFlag(flag);

    if (isMythic && !item.hasItemBooleanFlag(vitalStrikeMythic)) {
        // addFlag(vitalStrikeMythic);
    }
    else if (isGreater && !item.hasItemBooleanFlag(vitalStrikeGreater)) {
        addFlag(vitalStrikeGreater);
    }
    else if (isImproved && !item.hasItemBooleanFlag(vitalStrikeImproved)) {
        addFlag(vitalStrikeImproved);
    }
    else if (isRegular && !item.hasItemBooleanFlag(vitalStrike)) {
        addFlag(vitalStrike);
    }
}
