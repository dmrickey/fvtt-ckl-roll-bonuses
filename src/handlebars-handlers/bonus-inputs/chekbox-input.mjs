import { MODULE_NAME } from "../../consts.mjs";
import { localizeBonusLabel } from '../../util/localize.mjs';
import { addNodeToRollBonus } from "../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../templates.mjs";

/**
 * @param {object} args
 * @param {boolean} [args.current]
 * @param {ItemPF} args.item
 * @param {string} args.key
 * @param {string} [args.label]
 * @param {HTMLElement} args.parent,
 * @param {object} [o]
 * @param {boolean} [o.isModuleFlag] - false (default) if this is a dictionary flag, true if this is a data flag
 */
export function checkboxInput({
    current = false,
    item,
    key,
    label = '',
    parent,
}, {
    isModuleFlag = false,
} = {}
) {
    label ||= localizeBonusLabel(key);
    current ||= isModuleFlag
        ? item.getFlag(MODULE_NAME, key)
        : item.getItemDictionaryFlag(key);

    const div = createTemplate(
        templates.checkboxInput,
        { key, label, current },
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

    addNodeToRollBonus(parent, div, item);
}
