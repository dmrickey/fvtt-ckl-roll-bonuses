import { MODULE_NAME } from '../consts.mjs';
import { Distance } from '../util/distance.mjs';
import { currentTargets } from '../util/get-current-targets.mjs';
import { customGlobalHooks } from '../util/hooks.mjs'
import { localize } from '../util/localize.mjs';
import { AutomaticCombatBonusSettings } from '../util/settings.mjs';

const disabledActorFlag = 'disable-ranged-attack-penalty';

/**
 * @param { ItemAction} action
 * @param {RollData} rollData
 */
export const initRollData = (action, rollData) => {
    const { actor } = action;
    if (!AutomaticCombatBonusSettings.setting('range-increments') || actor?.getFlag(MODULE_NAME, disabledActorFlag)) {
        return;
    }

    if (rollData.rangePenalty !== undefined) {
        return;
    }

    const isRangedAttack = ['rcman', 'rwak', 'rsak', 'twak'].includes(action.data.actionType);
    if (!isRangedAttack) {
        return;
    }

    if (!['ft', 'm'].includes(rollData.action?.range?.units || '')) {
        return;
    }

    const range = RollPF.safeTotal(rollData.action?.range?.value ?? '0');
    if (!range) {
        return;
    }

    const maxIncrements = rollData.action?.range?.maxIncrements ?? Number.POSITIVE_INFINITY;
    if (!maxIncrements) {
        return;
    }

    rollData.rangePenalty = {
        maxIncrements,
        range,
        penalty: 2,
    };
}

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

    if (!AutomaticCombatBonusSettings.setting('range-increments') || actor.getFlag(MODULE_NAME, disabledActorFlag)) {
        return;
    }

    const { rangePenalty } = shared.rollData;
    if (!rangePenalty) {
        return;
    }

    const actorToken = actionUse.token || actor.getActiveTokens()[0];
    const targets = currentTargets();

    if (!actorToken || !targets.length) {
        return;
    }

    const { maxIncrements, range, penalty } = rangePenalty;

    let distance = 0;
    targets.forEach((target) => {
        const d = new Distance(actorToken, target);
        distance = Math.max(distance, d.distance());
    });

    const steps = Math.ceil(distance / range);

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
