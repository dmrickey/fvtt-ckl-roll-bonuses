import { showEnabledLabel } from '../handlebars-handlers/enabled-label.mjs';
import { LocalHookHandler, localHooks } from '../util/hooks.mjs';
import { SpecificBonuses } from './all-specific-bonuses.mjs';

const key = 'snake-sidewind';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#snake-sidewind';

Hooks.once('ready', () =>
    SpecificBonuses.registerSpecificBonus({ journal, key, type: 'boolean' })
);

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

    const hasFlag = chatAttack.action?.item?.system.flags.boolean?.hasOwnProperty(key);
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
    const maxAttack = new pf1.dice.D20RollPF(critConfirm.simplifiedFormula, chatAttack.rollData).evaluate({ maximize: true, async: false }).total;

    const chat = await actor.rollSkill('sen', { skipDialog: true });
    const skillFormula = chat.roll.formula;
    const skillTotal = new pf1.dice.D20RollPF(skillFormula, chatAttack.rollData).evaluate({ maximize: true, async: false });

    if (skillTotal > maxAttack) {
        chatAttack.critConfirm = new pf1.dice.D20RollPF(skillFormula, chatAttack.rollData);
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
