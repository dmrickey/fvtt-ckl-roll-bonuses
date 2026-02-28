import { localizeBonusLabel, localizeBonusTooltip } from '../../util/localize.mjs';
import { addNodeToRollBonus } from '../add-bonus-to-item-sheet.mjs';
import { createTemplate, templates } from '../templates.mjs';

/**
 * @overload
 * @param {object} args
 * @param {ItemPF} args.item
 * @param {string} [args.journal]
 * @param {string} args.label
 * @param {HTMLElement} args.parent,
 * @param {string} [args.tooltip]
 * @param {object} options
 * @param {InputType} options.inputType
 * @param {boolean} [options.isSubLabel]
 * @param {string} [options.extraClasses]
 * @returns {void}
 */

/**
 * @overload
 * @param {object} args
 * @param {ItemPF} args.item
 * @param {string | undefined} args.journal
 * @param {string} args.key
 * @param {string} [args.label]
 * @param {HTMLElement} args.parent,
 * @param {string} [args.tooltip]
 * @param {object} options
 * @param {InputType} options.inputType
 * @param {boolean} [options.isSubLabel]
 * @param {string} [options.extraClasses]
 * @returns {void}
 */

/**
 * @param {object} args
 * @param {ItemPF} args.item
 * @param {string | undefined} [args.journal]
 * @param {string | undefined} [args.key]
 * @param {string} [args.label]
 * @param {HTMLElement} args.parent,
 * @param {string} [args.tooltip]
 * @param {object} options
 * @param {InputType} options.inputType
 * @param {boolean} [options.isSubLabel]
 * @param {string} [options.extraClasses]
 */
export function showLabel({
    item,
    journal = undefined,
    key,
    label = '',
    parent,
    tooltip = '',
}, {
    inputType,
    isSubLabel = false,
    extraClasses = '',
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
            extraClasses,
        },
    );

    addNodeToRollBonus(parent, div, item, true, inputType);
}
