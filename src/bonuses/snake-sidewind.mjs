import { showEnabledLabel } from '../handlebars-handlers/enabled-label.mjs';
import { hasAnyBFlag } from '../util/flag-helpers.mjs';
import { getSkillFormula } from '../util/get-skill-formula.mjs';
import { LocalHookHandler, localHooks } from '../util/hooks.mjs';
import { SpecificBonuses } from './all-specific-bonuses.mjs';

const key = 'snake-sidewind';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#snake-sidewind';

Hooks.once('ready', () =>
    SpecificBonuses.registerSpecificBonus({ journal, key, type: 'boolean' })
);

/**
 * @param {string} formula
 * @param {RollData} rollData
 * @returns {number}
 */
const getFormulaMax = (formula, rollData) => {
    const mods = formula.substring(formula.indexOf(' ') + 1);
    const safeFormula = `0 + ${mods}`
    const roll = new pf1.dice.D20RollPF(safeFormula, rollData, { skipDialog: true }).evaluate({ maximize: true, async: false })
    const max = roll.total;
    return max;
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

    // const hasFlag = chatAttack.action?.item?.system.flags.boolean?.hasOwnProperty(key);
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
        chatAttack.critConfirm = new pf1.dice.D20RollPF(skillFormula, chatAttack.rollData, { skipDialog: true }).evaluate({ async: false });
    }
}
LocalHookHandler.registerHandler(localHooks.chatAttackAddAttack, chatAttackAddAttack);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const hasFlag = item.system.flags.boolean?.hasOwnProperty(key);
    if (!hasFlag) {
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
