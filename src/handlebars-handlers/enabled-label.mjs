import { localizeBonusLabel, localizeBonusTooltip } from '../util/localize.mjs';
import { addNodeToRollBonus } from "./add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "./templates.mjs";

/**
 * @param {object} args
 * @param {ItemPF} args.item
 * @param {string} args.key
 * @param {string} [args.label]
 * @param {HTMLElement} args.parent,
 * @param {string} [args.subLabel]
 * @param {string} [args.tooltip]
 */
export function showEnabledLabel({
    item,
    key,
    label = '',
    parent,
    subLabel = '',
    tooltip = '',
}) {
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);
    const div = createTemplate(
        templates.enabledLabel,
        { label, parent, subLabel, tooltip },
    );

    addNodeToRollBonus(parent, div, item);
}
