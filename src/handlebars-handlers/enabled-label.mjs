import { addNodeToRollBonus } from "./roll-bonus-on-item-sheet.mjs";
import { createTemplate, templates } from "./templates.mjs";

/**
 * @param {object} args
 * @param {string} args.label
 * @param {HTMLElement} args.parent,
 * @param {string} [args.subLabel]
 */
export function showEnabledLabel({
    label,
    parent,
    subLabel = '',
}) {
    const div = createTemplate(
        templates.enabledLabel,
        { label, parent, subLabel, },
    );

    addNodeToRollBonus(parent, div);
}
