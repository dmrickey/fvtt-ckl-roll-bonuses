import { MODULE_NAME } from '../consts.mjs';
import { showEnabledLabel } from '../handlebars-handlers/enabled-label.mjs';
import { isMelee } from '../util/action-type-helpers.mjs';
import { getCachedBonuses } from '../util/get-cached-bonuses.mjs';
import { LocalHookHandler, customGlobalHooks, localHooks } from '../util/hooks.mjs';
import { isActorInCombat } from '../util/is-actor-in-combat.mjs';
import { registerItemHint } from '../util/item-hints.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../util/localize.mjs';
import { LanguageSettings } from '../util/settings.mjs';
import { SpecificBonus } from './_specific-bonus.mjs';

const furiousFocusTimestamp = 'furious-focus-timestamp';

export class FuriousFocus extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'furious-focus'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium'; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'UcEIgufLJlIfhHmu',
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
    static get name() { return LanguageSettings.getTranslation(FuriousFocus.key); }

    static {
        LanguageSettings.registerItemNameTranslation(FuriousFocus.key);
    }
}

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const has = !!item.hasItemBooleanFlag(FuriousFocus.key);
    if (!has) {
        return;
    }

    const hint = hintcls.create('', [], { hint: localizeBonusTooltip(FuriousFocus.key), icon: 'fas fa-burst' });
    return hint;
});

/** @returns {string} */
const label = () => { return localizeBonusLabel(FuriousFocus.key); }

/**
 * @param {ActionUse<ItemWeaponPF>} actionUse
 * @param {ConditionalPartsResults} result
 * @param {object} atk - The attack used.
 * @param {number} index - The index of the attack, in order of enabled attacks.
 */
function getConditionalParts(actionUse, result, atk, index) {
    const { actor, shared } = actionUse;
    if (index !== 0 || !actor || !shared) {
        return;
    }

    const hasFocus = actor.hasItemBooleanFlag(FuriousFocus.key);
    const penalty = shared.rollData.powerAttackPenalty || 0;
    const hasUsed = hasUsedFF(actor);
    const isMeleeAttack = isMelee(shared.item, shared.action);
    const is2h = shared.rollData.action?.held === '2h';
    if (shared.powerAttack && isMeleeAttack && is2h && hasFocus && penalty && !hasUsed) {
        result['attack.normal'].push(`${penalty * -1}[${label()}]`);
        setUsedFF(actor);
    }
}
Hooks.on(customGlobalHooks.getConditionalParts, getConditionalParts);

/**
 * @param {ChatAttack} chatAttack
 */
async function addEffectNotes(chatAttack) {
    const { actor, attack, effectNotes } = chatAttack;
    if (attack?.terms.some((x) => x.options?.flavor === label())) {
        effectNotes.push({ text: label(), source: getCachedBonuses(actor, FuriousFocus.key)[0]?.name });
    }
}
LocalHookHandler.registerHandler(localHooks.chatAttackEffectNotes, addEffectNotes);

/** @param {ActorPF} actor */
const hasUsedFF = (actor) => isActorInCombat(actor) && actor.getFlag(MODULE_NAME, furiousFocusTimestamp) === game.time.worldTime;
/** @param {ActorPF} actor */
const setUsedFF = (actor) => isActorInCombat(actor)
    ? actor.setFlag(MODULE_NAME, furiousFocusTimestamp, game.time.worldTime)
    : actor.setFlag(MODULE_NAME, furiousFocusTimestamp, null);
