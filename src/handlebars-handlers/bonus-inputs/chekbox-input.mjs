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
 * @param {object} options
 * @param {boolean} options.canEdit
 * @param {InputType} options.inputType
 * @param {boolean} [options.isSubLabel]
 */
export function checkboxInput({
    current = undefined,
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
}
) {
    if (current === undefined) {
        current = !!item.getFlag(MODULE_NAME, key);
    }
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);

    const div = createTemplate(
        templates.checkboxInput,
        {
            current,
            isSubLabel,
            journal,
            key,
            label,
            readonly: !canEdit,
            tooltip,
        },
    );
    /** @type {HTMLInputElement | null} */
    const checkbox = div.querySelector(`#checkbox-input-${key}`);
    if (!checkbox) {
        return;
    }

    checkbox.checked = current;
    checkbox.addEventListener(
        'change',
        async (event) => {
            if (!key) return;
            // @ts-ignore
            const value = event.currentTarget.checked;

            await item.setFlag(MODULE_NAME, key, value);
        },
    );

    addNodeToRollBonus(parent, div, item, canEdit, inputType);
}

api.inputs.checkboxInput = checkboxInput;
