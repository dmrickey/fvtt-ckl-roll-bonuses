import { addNodeToRollBonus } from "./add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "./templates.mjs";

/**
 * @param {object} args
 * @param {ItemPF} args.item
 * @param {string} args.label
 * @param {HTMLElement} args.parent,
 * @param {string} [args.subLabel]
 */
export function showEnabledLabel({
    item,
    label,
    parent,
    subLabel = '',
}) {
    const div = createTemplate(
        templates.enabledLabel,
        { label, parent, subLabel, },
    );

    addNodeToRollBonus(parent, div, item);
}
