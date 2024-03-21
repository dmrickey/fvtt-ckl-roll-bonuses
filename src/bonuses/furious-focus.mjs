import { MODULE_NAME } from '../consts.mjs';
import { showEnabledLabel } from '../handlebars-handlers/enabled-label.mjs';
import { hasAnyBFlag } from '../util/flag-helpers.mjs';
import { customGlobalHooks } from '../util/hooks.mjs';
import { localizeGenericBonusLabel } from '../util/localize.mjs';

const furiousFocus = 'furious-focus';
const furiousFocusTimestamp = 'furious-focus-timestamp';

/** @returns {string} */
const label = () => { return localizeGenericBonusLabel(furiousFocus); }

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

    const hasFocus = () => hasAnyBFlag(actor, furiousFocus);
    const penalty = shared.rollData.powerAttackPenalty || 0;
    const hasUsed = hasUsedFF(actor);
    if (shared.powerAttack && hasFocus() && penalty && !hasUsed) {
        result['attack.normal'].push(`${penalty * -1}[${label()}]`);
        setUsedFF(actor);
    }
}
Hooks.on(customGlobalHooks.getConditionalParts, getConditionalParts);

/**
 * @param {ChatAttack} chatAttack
 */
function addFuriousFocusEffectNote(chatAttack) {
    const { attack, effectNotes } = chatAttack;
    if (attack.terms.some((x) => x.options?.flavor === label())) {
        effectNotes.push(label());
    }
}
Hooks.on(customGlobalHooks.chatAttackEffectNotes, addFuriousFocusEffectNote);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const hasFlag = item.system.flags.boolean?.hasOwnProperty(furiousFocus);
    if (!hasFlag) {
        return;
    }
    showEnabledLabel({
        label: label(),
        parent: html,
    });
});

/** @param {ActorPF} actor */
const hasUsedFF = (actor) => actor.getFlag(MODULE_NAME, furiousFocusTimestamp) === game.time.worldTime;
/** @param {ActorPF} actor */
const setUsedFF = (actor) => actor.setFlag(MODULE_NAME, furiousFocusTimestamp, game.time.worldTime);
