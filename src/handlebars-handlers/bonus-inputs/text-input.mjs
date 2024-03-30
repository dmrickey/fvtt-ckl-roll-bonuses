import { MODULE_NAME } from "../../consts.mjs";
import { localizeBonusLabel, localizeBonusTooltip } from '../../util/localize.mjs';
import { addNodeToRollBonus } from "../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../templates.mjs";

/**
 * @param {object} args
 * @param {FlagValue} [args.current]
 * @param {ItemPF} args.item
 * @param {string} args.journal
 * @param {string} args.key
 * @param {string} [args.label]
 * @param {string} [args.tooltip]
 * @param {HTMLElement} args.parent,
 * @param {object} [o]
 * @param {string} [o.placeholder]
 * @param {boolean} [o.isFormula]
 * @param {boolean} [o.isModuleFlag] - false (default) if this is a dictionary flag, true if this is a data flag
 */
export function textInput({
    current = '',
    item,
    journal,
    key,
    label = '',
    parent,
    tooltip = '',
}, {
    placeholder = '',
    isFormula = true,
    isModuleFlag = false,
} = {}
) {
    current ||= isModuleFlag
        ? item.getFlag(MODULE_NAME, key)
        : item.getItemDictionaryFlag(key);
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);

    const div = createTemplate(
        templates.textInput,
        {
            current,
            isFormula,
            journal,
            key,
            label,
            placeholder,
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

            isModuleFlag
                ? await item.setFlag(MODULE_NAME, key, target?.value)
                : await item.setItemDictionaryFlag(key, target?.value);
        },
    );

    addNodeToRollBonus(parent, div, item);
}
