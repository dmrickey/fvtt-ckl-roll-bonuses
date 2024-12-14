import { api } from '../util/api.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../util/localize.mjs';
import { addNodeToRollBonus } from "./add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "./templates.mjs";

/**
 * @param {object} args
 * @param {ItemPF} args.item
 * @param {string} args.journal
 * @param {string} args.key
 * @param {string} [args.label]
 * @param {HTMLElement} args.parent
 * @param {string} [args.subLabel]
 * @param {string} [args.tooltip]
 * @param {object} options
 * @param {boolean} options.canEdit
 * @param {InputType} options.inputType
 */
export function showInvalidLabel({
    item,
    key,
    label = '',
    journal,
    parent,
    subLabel = '',
    tooltip = '',
}, {
    canEdit,
    inputType,
}) {
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);
    const div = createTemplate(
        templates.invalidLabel,
        {
            journal,
            label,
            parent,
            subLabel,
            tooltip,
        },
    );

    addNodeToRollBonus(parent, div, item, canEdit, inputType);
}

api.inputs.showInvalidLabel = showInvalidLabel;
