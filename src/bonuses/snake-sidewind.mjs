import { showEnabledLabel } from '../handlebars-handlers/enabled-label.mjs';
import { getCachedBonuses } from '../util/get-cached-bonuses.mjs';
import { getSkillFormula } from '../util/get-skill-formula.mjs';
import { LocalHookHandler, localHooks } from '../util/hooks.mjs';
import { registerItemHint } from '../util/item-hints.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../util/localize.mjs';
import { LanguageSettings } from '../util/settings.mjs';
import { SpecificBonus } from './_specific-bonus.mjs';

export class SnakeSidewind extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'snake-sidewind'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#snake-sidewind'; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: '6HVdbIFcRuTq8o7p',
            isItemMatchFunc: (name) => name === Settings.name,
            showInputsFunc: (item, html, isEditable) => {
                showEnabledLabel({
                    item,
                    journal: this.journal,
                    key: this.key,
                    parent: html,
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
        };
    }
}

class Settings {
    static get name() { return LanguageSettings.getTranslation(SnakeSidewind.key); }

    static {
        LanguageSettings.registerItemNameTranslation(SnakeSidewind.key);
    }
}

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const has = !!item.hasItemBooleanFlag(SnakeSidewind.key);
    if (!has) {
        return;
    }

    const hint = hintcls.create('', [], { hint: localizeBonusTooltip(SnakeSidewind.key), icon: 'ra ra-snake' });
    return hint;
});

/**
 * @param {string} formula
 * @param {RollData} rollData
 * @returns {number}
 */
const getFormulaMax = (formula, rollData) => {
    const roll = new pf1.dice.D20RollPF(formula, rollData, { skipDialog: true }).evaluateSync({ maximize: true });
    const max = roll.total;
    return max;
}

/**
 * @param {ChatAttack} chatAttack
 * @returns {string | undefined}
 */
const isSnakeSideWindCrit = (chatAttack) => {
    const hasFlag = chatAttack.action?.actor.hasItemBooleanFlag(SnakeSidewind.key);
    if (!hasFlag) {
        return;
    }

    // TODO check if this action is `Unarmed Strike`
    // TODO add item warning if no `Unarmed Strike` detected on this actor
    // if (!isUnarmed) {
    //     return;
    // }

    const { critConfirm } = chatAttack;
    if (!critConfirm) {
        return;
    }

    const actor = chatAttack.action.actor;
    if (!actor) {
        return;
    }

    const critFormula = critConfirm.terms.map(x => x.formula).join(' ');
    const maxAttack = getFormulaMax(critFormula, chatAttack.rollData);

    const skillFormula = getSkillFormula(actor, chatAttack.rollData, 'sen', { includeD20: true });
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
    if (formula && chatAttack.critConfirm) {
        // TODO find proper index
        const index = chatAttack.critConfirm.terms.findIndex(x => x);
        // TODO try to swap out the confirm attack roll instead of re-rolling
        // see here https://discord.com/channels/170995199584108546/722559135371231352/1331699422563668090
        chatAttack.critConfirm = await new pf1.dice.D20RollPF(formula, chatAttack.rollData)
            .evaluate({ allowInteractive: false });
    }
}
LocalHookHandler.registerHandler(localHooks.chatAttackAddAttack, chatAttackAddAttack);

/**
 * @param {ChatAttack} chatAttack
 */
async function addEffectNotes(chatAttack) {
    const { actor, attack, effectNotes } = chatAttack;
    if (attack?.isCrit) {
        if (isSnakeSideWindCrit(chatAttack)) {
            effectNotes.push({ text: localizeBonusLabel(SnakeSidewind.key), source: getCachedBonuses(actor, SnakeSidewind.key)[0]?.name });
        }
    }
}
LocalHookHandler.registerHandler(localHooks.chatAttackEffectNotes, addEffectNotes);
