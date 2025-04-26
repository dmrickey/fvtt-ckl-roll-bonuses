import { localizeBonusLabel, localizeBonusTooltip } from '../../util/localize.mjs';
import { addNodeToRollBonus } from '../add-bonus-to-item-sheet.mjs';
import { createTemplate, templates } from '../templates.mjs';

/**
 * @overload
 * @param {object} args
 * @param {ItemPF} args.item
 * @param {string} args.journal
 * @param {string} args.label
 * @param {HTMLElement} args.parent,
 * @param {string} args.tooltip
 * @param {object} options
 * @param {InputType} options.inputType
 * @param {boolean} [options.isSubLabel]
 * @returns {void}
 */

/**
 * @overload
 * @param {object} args
 * @param {ItemPF} args.item
 * @param {string} args.journal
 * @param {string} args.key
 * @param {string} [args.label]
 * @param {HTMLElement} args.parent,
 * @param {string} [args.tooltip]
 * @param {object} options
 * @param {InputType} options.inputType
 * @param {boolean} [options.isSubLabel]
 * @returns {void}
 */

/**
 * @param {object} args
 * @param {ItemPF} args.item
 * @param {string} args.journal
 * @param {string | undefined} [args.key]
 * @param {string} [args.label]
 * @param {HTMLElement} args.parent,
 * @param {string} [args.tooltip]
 * @param {object} options
 * @param {InputType} options.inputType
 * @param {boolean} [options.isSubLabel]
 */
export function showLabel({
    item,
    journal,
    key,
    label = '',
    parent,
    tooltip = '',
}, {
    inputType,
    isSubLabel = false,
}) {
    if (key) {
        label ||= localizeBonusLabel(key);
        tooltip ||= localizeBonusTooltip(key);
    }

    const div = createTemplate(
        templates.label,
        {
            isSubLabel,
            journal,
            label,
            tooltip,
        },
    );

    addNodeToRollBonus(parent, div, item, true, inputType);
}
