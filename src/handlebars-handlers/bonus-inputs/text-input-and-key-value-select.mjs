import { addNodeToRollBonus } from "../add-bonus-to-item-sheet.mjs";
import { api } from '../../util/api.mjs';
import { createTemplate, templates } from "../templates.mjs";
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../../util/localize.mjs";
import { MODULE_NAME } from '../../consts.mjs';

/**
 * @param {object} args
 * @param {{current?: FlagValue, key: string, placeholder?: string}} args.text
 * @param {{current?: FlagValue, key: string, choices: {key: string, label: string}[] | Record<string, string>}} args.select
 * @param {ItemPF} args.item
 * @param {string} args.journal
 * @param {string} [args.label]
 * @param {HTMLElement} args.parent
 * @param {string} [args.tooltip]
 * @param {object} options
 * @param {boolean} options.canEdit
 * @param {InputType} options.inputType
 * @param {boolean} [options.isSubLabel]
 */
export function textInputAndKeyValueSelect({
    item,
    journal,
    label = '',
    parent,
    select,
    text,
    tooltip = '',
}, {
    canEdit,
    inputType,
    isSubLabel = false,
}) {
    label ||= localizeBonusLabel(select.key);
    tooltip ||= localizeBonusTooltip(select.key);

    const choices = Array.isArray(select.choices)
        ? select.choices
        : Object.entries(select.choices).map(([key, label]) => ({ key, label }));

    if (text.current === undefined) {
        text.current = item.getFlag(MODULE_NAME, text.key);
    }
    if (select.current === undefined) {
        select.current = item.getFlag(MODULE_NAME, select.key);
    }

    if (canEdit) {
        if ((!select.current && choices.length) || (choices.length === 1 && select.current !== choices[0].key)) {
            item.setFlag(MODULE_NAME, select.key, choices[0].key);
        }
    }

    const div = createTemplate(
        templates.textInputAndKeyValueSelect,
        {
            choices,
            current: select.current,
            formula: text.current,
            isSubLabel,
            journal,
            label,
            placeholder: text.placeholder || localize('PF1.Formula'),
            readonly: !canEdit,
            selectKey: select.key,
            textKey: text.key,
            tooltip,
        },
    );

    const input = div.querySelector(`#text-input-${text.key}`);
    input?.addEventListener(
        'change',
        async (event) => {
            // @ts-ignore - event.target is HTMLTextAreaElement
            const /** @type {HTMLTextAreaElement} */ target = event.target;
            await item.setFlag(MODULE_NAME, text.key, target?.value);
        },
    );

    const selector = div.querySelector(`#key-value-selector-${select.key}`);
    selector?.addEventListener(
        'change',
        async (event) => {
            // @ts-ignore - event.target is HTMLTextAreaElement
            const /** @type {HTMLTextAreaElement} */ target = event.target;
            await item.setFlag(MODULE_NAME, select.key, target?.value);
        },
    );

    addNodeToRollBonus(parent, div, item, canEdit, inputType);
}

api.inputs.textInputAndKeyValueSelect = textInputAndKeyValueSelect;
