import { addNodeToRollBonus } from "../roll-bonus-on-actor-sheet.mjs";
import { templates } from "../init.mjs";

/**
 * @param {object} args
 * @param {string[]} args.choices
 * @param {FlagValue} args.current
 * @param {ItemPF} args.item
 * @param {string} args.key
 * @param {string} args.label
 * @param {HTMLElement} args.parent,
 */
export function stringSelect({
    current,
    item,
    key,
    label,
    choices,
    parent,
}) {
    choices.sort();
    if ((!current && choices.length) || (choices.length === 1 && current !== choices[0])) {
        item.setItemDictionaryFlag(key, choices[0]);
    }

    const template = Handlebars.partials[templates.stringSelect](
        { key, label, current, choices },
        { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true }
    );
    const div = document.createElement('div');
    div.innerHTML = template;
    const select = div.querySelector(`#string-selector-${key}`);
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
