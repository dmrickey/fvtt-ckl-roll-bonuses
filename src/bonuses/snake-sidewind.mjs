import { showEnabledLabel } from '../handlebars-handlers/enabled-label.mjs';
import { hasAnyBFlag } from '../util/flag-helpers.mjs';
import { getSkillFormula } from '../util/get-skill-formula.mjs';
import { LocalHookHandler, localHooks } from '../util/hooks.mjs';
import { localizeBonusLabel } from '../util/localize.mjs';
import { LanguageSettings } from '../util/settings.mjs';
import { SpecificBonuses } from './all-specific-bonuses.mjs';

const key = 'snake-sidewind';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#snake-sidewind';

Hooks.once('ready', () =>
    SpecificBonuses.registerSpecificBonus({ journal, key, type: 'boolean' })
);

class Settings {
    static get snakeSidewind() { return LanguageSettings.getTranslation(key); }

    static {
        LanguageSettings.registerItemNameTranslation(key);
    }
}

/**
 * @param {string} formula
 * @param {RollData} rollData
 * @returns {number}
 */
const getFormulaMax = (formula, rollData) => {
    const mods = formula.substring(formula.indexOf(' ') + 1);
    const safeFormula = `0 + ${mods}`;
    const roll = new pf1.dice.D20RollPF(safeFormula, rollData, { skipDialog: true }).evaluate({ maximize: true, async: false });
    const max = roll.total;
    return max;
}

/**
 * @param {ChatAttack} chatAttack
 * @returns {string | undefined}
 */
const isSnakeSideWindCrit = (chatAttack) => {
    const hasFlag = hasAnyBFlag(chatAttack.action?.actor, key);
    if (!hasFlag) {
        return;
    }

    const { critConfirm } = chatAttack;
    if (!critConfirm) {
        return;
    }

    const actor = chatAttack.action.actor;
    if (!actor) {
        return;
    }

    const maxAttack = getFormulaMax(critConfirm.simplifiedFormula, chatAttack.rollData);

    const skillFormula = getSkillFormula(actor, chatAttack.rollData, 'sen');
    const skillMax = getFormulaMax(skillFormula, chatAttack.rollData);

    if (skillMax >= maxAttack) {
        return skillFormula;
    }
}

/**
 * @param {ChatAttack} chatAttack
 * @param {object} args
 * @param {boolean} [args.noAttack]
 * @param {unknown} [args.bonus]
 * @param {unknown[]} [args.extraParts]
 * @param {boolean} [args.critical] Whether or not this roll is a for a critical confirmation
 * @param {object} [args.conditionalParts]
 */
const chatAttackAddAttack = async (chatAttack, args) => {
    if (!args.critical) {
        return;
    }

    const formula = isSnakeSideWindCrit(chatAttack)
    if (formula) {
        chatAttack.critConfirm = new pf1.dice.D20RollPF(formula, chatAttack.rollData, { skipDialog: true }).evaluate({ async: false });
    }
}
LocalHookHandler.registerHandler(localHooks.chatAttackAddAttack, chatAttackAddAttack);

/**
 * @param {ChatAttack} chatAttack
 */
async function addEffectNotes(chatAttack) {
    const { attack, effectNotes } = chatAttack;
    if (attack?.isCrit) {
        if (isSnakeSideWindCrit(chatAttack)) {
            effectNotes.push(localizeBonusLabel(key));
        }
    }
}
LocalHookHandler.registerHandler(localHooks.chatAttackEffectNotes, addEffectNotes);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const name = item?.name?.toLowerCase() ?? '';

    const hasFlag = item.system.flags.boolean?.hasOwnProperty(key);
    if (!hasFlag) {
        if (name === Settings.snakeSidewind) {
            item.update({ [`system.flags.boolean.${key}`]: true });
        }
        return;
    }

    showEnabledLabel({
        item,
        journal,
        key,
        parent: html,
    }, {
        canEdit: isEditable,
    });
});
