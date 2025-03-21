import { MODULE_NAME } from '../../consts.mjs';
import { api } from '../../util/api.mjs';
import { localize, localizeBonusLabel, localizeBonusTooltip } from '../../util/localize.mjs';
import { addNodeToRollBonus } from "../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../templates.mjs";

/**
 * @param {object} args
 * @param {string[]} args.choices
 * @param {FlagValue} [args.current]
 * @param {ItemPF} args.item
 * @param {string} args.journal
 * @param {string} args.key
 * @param {string} [args.label]
 * @param {string} [args.tooltip]
 * @param {HTMLElement} args.parent
 * @param {object} options
 * @param {boolean} options.canEdit
 * @param {InputType} options.inputType
*/
export function stringSelect({
    choices,
    current,
    item,
    journal,
    key,
    label = '',
    parent,
    tooltip = '',
}, {
    canEdit,
    inputType,
}) {
    current ||= item.getFlag(MODULE_NAME, key);
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);

    choices.sort();
    if (canEdit) {
        if ((!current && choices.length) || (choices.length === 1 && current !== choices[0])) {
            item.setFlag(MODULE_NAME, key, choices[0]);
        }
    }

    let errorMsg = '';
    if (!choices.length) {
        errorMsg = localize('string-select.no-choices');
    }

    const div = createTemplate(
        templates.stringSelect,
        {
            choices: choices.map(c => ({ value: c, label: c })),
            current,
            errorMsg,
            journal,
            key,
            label,
            readonly: !canEdit,
            tooltip,
        },
    );
    const select = div.querySelector(`#string-selector-${key}`);
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

api.inputs.stringSelect = stringSelect;
