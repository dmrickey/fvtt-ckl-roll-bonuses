import { MODULE_NAME } from "../../consts.mjs";
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
 * @param {object} [options]
 * @param {boolean} [options.canEdit] - true (default)
 * @param {boolean} [options.isModuleFlag] - false (default) if this is a dictionary flag, true if this is a data flag
 */
export function checkboxInput({
    current = false,
    item,
    journal,
    key,
    label = '',
    parent,
    tooltip = '',
}, {
    canEdit = true,
    isModuleFlag = false,
} = {}
) {
    current ||= isModuleFlag
        ? item.getFlag(MODULE_NAME, key)
        : item.getItemDictionaryFlag(key);
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);

    const div = createTemplate(
        templates.checkboxInput,
        {
            current,
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

            isModuleFlag
                ? await item.setFlag(MODULE_NAME, key, value)
                : await item.setItemDictionaryFlag(key, value);
        },
    );

    addNodeToRollBonus(parent, div, item, canEdit);
}
