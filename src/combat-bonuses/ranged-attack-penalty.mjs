import { Distance } from '../util/distance.mjs';
import { currentTargets } from '../util/get-current-targets.mjs';
import { customGlobalHooks } from '../util/hooks.mjs'
import { localize } from '../util/localize.mjs';

/**
 * @param {ActionUse} actionUse
 */
function addRangedPenalty(actionUse) {
    const { actor, item, shared } = actionUse;
    if (!(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)) {
        return;
    }
    if (!actor || !shared?.rollData) {
        return;
    }

    const { rollData } = shared;

    if (!['ft', 'm'].includes(rollData.rangePenalty?.units || '')) {
        return;
    }

    const isRangedAttack = ['rcman', 'rwak', 'rsak', 'twak'].includes(actionUse.action.data.actionType);
    if (!isRangedAttack) {
        return;
    }

    const rangeStep = RollPF.safeTotal(rollData.rangePenalty?.value ?? '0');
    if (!rangeStep) {
        return;
    }

    const maxIncrements = rollData.rangePenalty?.maxIncrements ?? Number.POSITIVE_INFINITY;
    const penalty = rollData.rangePenalty?.rangePenalty;
    if (!maxIncrements || !penalty) {
        return;
    }

    const actorToken = actionUse.token || actor.getActiveTokens()[0];
    const targets = currentTargets();

    if (!actorToken || !targets.length) {
        return;
    }

    let distance = 0;
    targets.forEach((target) => {
        const d = new Distance(actorToken, target);
        distance = Math.max(distance, d.distance());
    });

    const steps = Math.ceil(distance / rangeStep);

    if (steps > maxIncrements) {
        shared.reject = true;
        targets.length > 1
            ? ui.notifications.warn(localize('range-increment-error-plural'))
            : ui.notifications.warn(localize('range-increment-error-singular'));
        return;
    }

    const total = -penalty * (steps - 1);
    if (total) {
        shared.attackBonus.push(`${total}[${localize('ranged-attack-penalty')}]`);
    }
}
Hooks.on(customGlobalHooks.actionUseAlterRollData, addRangedPenalty);
