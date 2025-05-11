import { MODULE_NAME } from '../../consts.mjs';
import { api } from '../../util/api.mjs';
import { localize, localizeBonusLabel, localizeBonusTooltip } from '../../util/localize.mjs';
import { addNodeToRollBonus } from "../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../templates.mjs";

/**
 * @param {object} args
 * @param {{key: string, label: string}[] | {[key: string]: string}} args.choices
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
 * @param {boolean} [options.isSubLabel]
 */
export function keyValueSelect({
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
    isSubLabel = false,
}) {
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);
    current ||= item.getFlag(MODULE_NAME, key);

    if (!Array.isArray(choices)) {
        choices = Object.entries(choices).map(([k, v]) => ({ key: k, label: v }));
    }

    if (canEdit) {
        if ((choices.length && (!current || !choices.some((c) => c.key === current)))
            || (choices.length === 1 && current !== choices[0].key)
        ) {
            item.setFlag(MODULE_NAME, key, choices[0].key);
        }
        else if (!choices.length && current) {
            item.setFlag(MODULE_NAME, key, '');
        }
    }

    let errorMsg = '';
    if (!choices.length) {
        errorMsg = localize('string-select.no-choices');
    }

    const div = createTemplate(
        templates.keyValueSelect,
        {
            choices,
            current,
            errorMsg,
            isSubLabel,
            journal,
            key,
            label,
            readonly: !canEdit,
            tooltip,
        },
    );
    const select = div.querySelector(`#key-value-selector-${key}`);
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

api.inputs.keyValueSelect = keyValueSelect;
