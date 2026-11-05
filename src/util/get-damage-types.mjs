import { api } from './api.mjs';
import { truthiness } from './truthiness.mjs';
import { uniqueArray } from './unique-array.mjs';

/**
 * @param {ItemAction} action
 * @returns {string[]}
 */
const getBaseActionDamageTypes = (action) => uniqueArray(
    action.damage.parts
        .flatMap(({ types }) => [...types])
        .filter(truthiness),
);

/**
 * @param {ActionUse | ItemAction} doc
 * @returns {string[]}
 */
const getEffectiveActionDamageTypes = (doc) => {
    const action = doc instanceof pf1.actionUse.ActionUse ? doc.action : doc;
    const damageTypes = new Set(getBaseActionDamageTypes(action));

    const damageBonus = api.bonusTypeMap.bonus_damage;
    const damageTypeTarget = api.targetTypeMap['target_damage-type'];

    if (!damageBonus || !api.utils.handleBonusesFor) {
        return [...damageTypes];
    }

    // fetches extra damage bonus types from DamageBonus sources
    // and ensures DamageTypeTarget does not recursively call itself when fetching sources
    let previousSize;
    do {
        previousSize = damageTypes.size;

        api.utils.handleBonusesFor(
            doc,
            (_bonusType, source) => {
                for (const type of damageBonus.getAddedDamageTypes(source)) {
                    if (type) {
                        damageTypes.add(type);
                    }
                }
            },
            {
                specificBonusType: damageBonus,
                targetMatcher: (targetType, source, thing) => {
                    if (targetType === damageTypeTarget) {
                        return damageTypeTarget.matchesDamageTypes(source, damageTypes);
                    }

                    return targetType.doesTargetInclude(source, thing);
                },
            },
        );
    } while (damageTypes.size !== previousSize);

    return [...damageTypes];
};

/**
 * @param {ItemPF | ActionUse | ItemAction} doc
 * @returns {string[]}
 */
export const getActionDamageTypes = (doc) => {
    if (doc instanceof pf1.documents.item.ItemPF) {
        return uniqueArray(
            [...(doc.actions ?? [])]
                .flatMap((action) => getEffectiveActionDamageTypes(action)),
        );
    }

    if (doc instanceof pf1.components.ItemAction || doc instanceof pf1.actionUse.ActionUse) {
        return getEffectiveActionDamageTypes(doc);
    }

    return [];
};

api.utils.getActionDamageTypes = getActionDamageTypes;
