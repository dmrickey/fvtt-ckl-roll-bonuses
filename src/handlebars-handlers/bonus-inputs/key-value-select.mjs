import { addNodeToRollBonus } from "../roll-bonus-on-actor-sheet.mjs";
import { createTemplate, templates } from "../templates.mjs";

/**
 * @param {object} args
 * @param {{key: string, label: string}[]} args.choices
 * @param {FlagValue} args.current
 * @param {ItemPF} args.item
 * @param {string} args.key
 * @param {string} args.label
 * @param {HTMLElement} args.parent,
 */
export function keyValueSelect({
    current,
    item,
    key,
    label,
    choices,
    parent,
}) {
    if ((!current && choices.length) || (choices.length === 1 && current !== choices[0].key)) {
        item.setItemDictionaryFlag(key, choices[0].key);
    }

    const template = createTemplate(
        templates.keyValueSelect,
        { key, label, current, choices },
    );
    const div = document.createElement('div');
    div.innerHTML = template;
    const select = div.querySelector(`#key-value-selector-${key}`);
    select?.addEventListener(
        'change',
        async (event) => {
            if (!key) return;

            // @ts-ignore - event.target is HTMLTextAreaElement
            const /** @type {HTMLTextAreaElement} */ target = event.target;
            await item.setItemDictionaryFlag(key, target?.value);
        },
    );

    addNodeToRollBonus(parent, div);
}
