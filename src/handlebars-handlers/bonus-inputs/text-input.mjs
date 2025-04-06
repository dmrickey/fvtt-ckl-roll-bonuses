import { MODULE_NAME } from "../../consts.mjs";
import { api } from '../../util/api.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../../util/localize.mjs';
import { addNodeToRollBonus } from "../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../templates.mjs";

/**
 * @overload
 * @param {object} args
 * @param {string[]} [args.choices]
 * @param {FlagValue} [args.current]
 * @param {ItemPF} args.item
 * @param {string} args.journal
 * @param {string} args.key
 * @param {string} [args.label]
 * @param {string} [args.tooltip]
 * @param {HTMLElement} args.parent,
 * @param {object} options
 * @param {boolean} options.canEdit
 * @param {InputType} options.inputType
 * @param {boolean} [options.isFormula]
 * @param {boolean} [options.isSubLabel]
 * @param {string} [options.placeholder]
 * @param {'text' | 'number'} [options.textInputType]
 * @returns {void}
 */

/**
 * @overload
 * @param {object} args
 * @param {never} [args.choices]
 * @param {FlagValue} [args.current]
 * @param {ItemPF} args.item
 * @param {string} args.journal
 * @param {string} args.key
 * @param {string} [args.label]
 * @param {string} [args.tooltip]
 * @param {HTMLElement} args.parent,
 * @param {object} options
 * @param {boolean} options.canEdit
 * @param {InputType} options.inputType
 * @param {false} options.isFormula
 * @param {boolean} [options.isSubLabel]
 * @param {string} [options.placeholder]
 * @param {'textarea'} [options.textInputType]
 * @returns {void}
 */

/**
 * @param {object} args
 * @param {string[]} [args.choices]
 * @param {FlagValue} [args.current]
 * @param {ItemPF} args.item
 * @param {string} args.journal
 * @param {string} args.key
 * @param {string} [args.label]
 * @param {string} [args.tooltip]
 * @param {HTMLElement} args.parent,
 * @param {object} options
 * @param {boolean} options.canEdit
 * @param {InputType} options.inputType
 * @param {boolean} [options.isFormula]
 * @param {boolean} [options.isSubLabel]
 * @param {string} [options.placeholder]
 * @param {'text' | 'number' | 'textarea'} [options.textInputType]
 */
export function textInput({
    choices = [],
    current = '',
    item,
    journal,
    key,
    label = '',
    parent,
    tooltip = '',
}, {
    canEdit,
    inputType,
    isFormula = true,
    isSubLabel = false,
    placeholder = '',
    textInputType = 'text',
}) {
    current ||= item.getFlag(MODULE_NAME, key);
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);

    const div = createTemplate(
        templates.textInput,
        {
            choices,
            current,
            isFormula,
            isSubLabel,
            isTextArea: textInputType === 'textarea',
            journal,
            key,
            label,
            placeholder,
            readonly: !canEdit,
            textInputType,
            tooltip,
        },
    );
    const select = div.querySelector(`#text-input-${key}`);
    select?.addEventListener(
        'change',
        async (event) => {
            if (!key) return;

            // @ts-ignore - event.target is HTMLTextAreaElement
            const /** @type {HTMLTextAreaElement} */ target = event.target;
            await item.setFlag(MODULE_NAME, key, target?.value);
        },
    );

    addNodeToRollBonus(parent, div, item, canEdit, inputType);
}

api.inputs.textInput = textInput;
