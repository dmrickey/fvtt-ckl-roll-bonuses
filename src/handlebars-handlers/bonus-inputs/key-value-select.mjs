import { MODULE_NAME } from '../../consts.mjs';
import { addNodeToRollBonus } from "../roll-bonus-on-item-sheet.mjs";
import { createTemplate, templates } from "../templates.mjs";

/**
 * @param {object} args
 * @param {{key: string, label: string}[] | {[key: string]: string}} args.choices
 * @param {FlagValue} [args.current]
 * @param {ItemPF} args.item
 * @param {string} args.key
 * @param {string} args.label
 * @param {HTMLElement} args.parent,
 * @param {object} [options]
 * @param {boolean} [options.isModuleFlag] - false (default) if this is a dictionary flag, true if this is a data flag
 */
export function keyValueSelect({
    current,
    item,
    key,
    label,
    choices,
    parent,
}, {
    isModuleFlag = false,
} = {}) {
    current ||= isModuleFlag
        ? item.getFlag(MODULE_NAME, key)
        : item.getItemDictionaryFlag(key);

    if (!Array.isArray(choices)) {
        choices = Object.entries(choices).map(([k, v]) => ({ key: k, label: v }));
    }

    if ((!current && choices.length) || (choices.length === 1 && current !== choices[0].key)) {
        item.setItemDictionaryFlag(key, choices[0].key);
        isModuleFlag
            ? item.setFlag(MODULE_NAME, key, choices[0].key)
            : item.setItemDictionaryFlag(key, choices[0].key);
    }

    const div = createTemplate(
        templates.keyValueSelect,
        { key, label, current, choices },
    );
    const select = div.querySelector(`#key-value-selector-${key}`);
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

    addNodeToRollBonus(parent, div);
}
