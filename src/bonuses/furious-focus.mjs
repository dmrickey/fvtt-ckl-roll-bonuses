import { showEnabledLabel } from '../handlebars-handlers/enabled-label.mjs';
import { hasAnyBFlag } from '../util/flag-helpers.mjs';
import { customGlobalHooks } from '../util/hooks.mjs';
import { localize } from '../util/localize.mjs';

const furiousFocus = 'furious-focus';

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
    if (shared.powerAttack && hasFocus() && penalty) {
        result['attack.normal'].push(`${penalty * -1}[${localize(furiousFocus)}]`);
    }
}
Hooks.on(customGlobalHooks.getConditionalParts, getConditionalParts);

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
        label: localize(furiousFocus),
        parent: html,
    });
});
