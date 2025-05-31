import { api } from '../../util/api.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../../util/localize.mjs';
import { addNodeToRollBonus } from "../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../templates.mjs";

/**
 * @param {object} args
 * @param {string} args.errorMsg
 * @param {ItemPF} args.item
 * @param {string} args.journal
 * @param {string} args.key
 * @param {string} [args.label]
 * @param {string} [args.tooltip]
 * @param {HTMLElement} args.parent,
 * @param {object} options
 * @param {boolean} options.canEdit
 * @param {InputType} options.inputType
 * @param {boolean} [options.isSubLabel]
 */
export function errorMessage({
    errorMsg,
    item,
    journal,
    key,
    label = '',
    parent,
    tooltip = '',
}, {
    canEdit,
    inputType,
    isSubLabel = false,
}) {
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);

    const div = createTemplate(
        templates.keyValueSelect,
        {
            errorMsg,
            isSubLabel,
            journal,
            label,
            tooltip,
        },
    );

    addNodeToRollBonus(parent, div, item, canEdit, inputType);
}

api.inputs.errorMessage = errorMessage;
