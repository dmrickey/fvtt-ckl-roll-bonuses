import { MODULE_NAME } from "../../consts.mjs";
import { addNodeToRollBonus } from "../roll-bonus-on-item-sheet.mjs";
import { createTemplate, templates } from "../templates.mjs";

/**
 * @param {object} args
 * @param {FlagValue} [args.current]
 * @param {ItemPF} args.item
 * @param {string} args.key
 * @param {string} args.label
 * @param {HTMLElement} args.parent,
 * @param {object} [o]
 * @param {string} [o.placeholder]
 * @param {boolean} [o.isFormula]
 * @param {boolean} [o.isFlag] - false (default) if this is a dictionary flag, true if this is a data flag
 */
export function textInput({
    current = '',
    item,
    key,
    label,
    parent,
}, {
    placeholder = '',
    isFormula = true,
    isFlag = false,
} = {}
) {
    if (!current) {
        current = isFlag
            ? item.getFlag(MODULE_NAME, key)
            : item.getItemDictionaryFlag(key);
    }

    const div = createTemplate(
        templates.textInput,
        { key, label, current, isFormula, placeholder },
    );
    const select = div.querySelector(`#text-input-${key}`);
    select?.addEventListener(
        'change',
        async (event) => {
            if (!key) return;

            // @ts-ignore - event.target is HTMLTextAreaElement
            const /** @type {HTMLTextAreaElement} */ target = event.target;

            isFlag
                ? await item.setFlag(MODULE_NAME, key, target?.value)
                : await item.setItemDictionaryFlag(key, target?.value);
        },
    );

    addNodeToRollBonus(parent, div);
}
