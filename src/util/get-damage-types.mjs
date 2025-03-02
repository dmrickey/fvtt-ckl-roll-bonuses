import { api } from './api.mjs';
import { truthiness } from './truthiness.mjs';
import { uniqueArray } from './unique-array.mjs';

/**
 * @param {ItemPF | ActionUse | ItemAction} doc
 * @returns {string[]}
 */
export const getActionDamageTypes = (doc) => {
    const action = doc instanceof pf1.components.ItemAction
        ? doc
        : doc instanceof pf1.actionUse.ActionUse
            ? doc.action
            : null;
    if (action) return _getActionDamageTypes(action);

    if (doc instanceof pf1.documents.item.ItemPF) {
        return uniqueArray(
            [...(doc.actions ?? [])]
                .flatMap((action) => _getActionDamageTypes(action))
        );
    }
    return [];
}
/**
 * @param {ItemAction} action
 * @returns {string[]}
 */
const _getActionDamageTypes = (action) => uniqueArray(
    action.damage.parts
        .flatMap(({ types }) => ([...types]))
        .filter(truthiness)
);

api.utils.getActionDamageTypes = getActionDamageTypes;
