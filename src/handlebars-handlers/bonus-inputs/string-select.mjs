import { MODULE_NAME } from '../../consts.mjs';
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
 * @param {boolean} [options.isModuleFlag] - false (default) if this is a dictionary flag, true if this is a data flag
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
    isModuleFlag = false,
}) {
    current ||= isModuleFlag
        ? item.getFlag(MODULE_NAME, key)
        : item.getItemDictionaryFlag(key);
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);

    choices.sort();
    if (canEdit) {
        if ((!current && choices.length) || (choices.length === 1 && current !== choices[0])) {
            isModuleFlag
                ? item.setFlag(MODULE_NAME, key, choices[0])
                : item.setItemDictionaryFlag(key, choices[0]);
        }
    }

    let errorMsg = '';
    if (!choices.length) {
        errorMsg = localize('string-select.no-choices');
    }

    const div = createTemplate(
        templates.stringSelect,
        {
            choices,
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
            isModuleFlag
                ? await item.setFlag(MODULE_NAME, key, target?.value)
                : await item.setItemDictionaryFlag(key, target?.value);
        },
    );

    addNodeToRollBonus(parent, div, item, canEdit);
}
