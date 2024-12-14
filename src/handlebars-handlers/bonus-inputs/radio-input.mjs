import { MODULE_NAME } from "../../consts.mjs";
import { api } from '../../util/api.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../../util/localize.mjs';
import { addNodeToRollBonus } from "../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../templates.mjs";

/**
 * @param {object} args
 * @param {boolean} [args.current]
 * @param {ItemPF} args.item
 * @param {string} args.journal
 * @param {string} args.key
 * @param {string} [args.label]
 * @param {HTMLElement} args.parent,
 * @param {string} [args.tooltip]
 * @param {{id: string, label: string}[]} args.values
 * @param {object} options
 * @param {boolean} options.canEdit
 * @param {InputType} options.inputType
 * @param {boolean} [options.isSubLabel]
 */
export function radioInput({
    current = undefined,
    item,
    journal,
    key,
    label = '',
    parent,
    tooltip = '',
    values,
}, {
    canEdit,
    inputType,
    isSubLabel = false,
}
) {
    if (current === undefined) {
        current = item.getFlag(MODULE_NAME, key);
        if (!current && values?.[0]?.id) {
            item.setFlag(MODULE_NAME, key, values[0].id);
        }
    }
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);

    const div = createTemplate(
        templates.radioInput,
        {
            current,
            isSubLabel,
            journal,
            key,
            label,
            name: `flags.${MODULE_NAME}.${key}`,
            readonly: !canEdit,
            tooltip,
            values,
        },
    );

    addNodeToRollBonus(parent, div, item, canEdit, inputType);
}

api.inputs.radioInput = radioInput;
