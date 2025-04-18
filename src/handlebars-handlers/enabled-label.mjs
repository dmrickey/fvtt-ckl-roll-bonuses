import { api } from '../util/api.mjs';
import { localize, localizeBonusLabel, localizeBonusTooltip } from '../util/localize.mjs';
import { addNodeToRollBonus } from "./add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "./templates.mjs";

/**
 * @param {object} args
 * @param {ItemPF} args.item
 * @param {string} args.journal
 * @param {string} args.key
 * @param {string} [args.label]
 * @param {HTMLElement} args.parent
 * @param {string} [args.forLabel]
 * @param {string} [args.subLabel]
 * @param {string} [args.text]
 * @param {string} [args.tooltip]
 * @param {object} options
 * @param {boolean} options.canEdit
 * @param {InputType} options.inputType
 */
export function showEnabledLabel({
    item,
    key,
    forLabel = '',
    label = '',
    journal,
    parent,
    subLabel = '',
    text = '',
    tooltip = '',
}, {
    canEdit,
    inputType,
}) {
    forLabel ||= key;
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);
    text ||= localize('PF1.Enabled');
    const div = createTemplate(
        templates.enabledLabel,
        {
            for: forLabel,
            journal,
            label,
            parent,
            subLabel,
            text,
            tooltip,
        },
    );

    addNodeToRollBonus(parent, div, item, canEdit, inputType);
}

api.inputs.showEnabledLabel = showEnabledLabel;
