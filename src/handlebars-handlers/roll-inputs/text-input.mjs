import { addNodeToRollBonus } from "../roll-bonus-on-actor-sheet.mjs";
import { templates } from "../init.mjs";

/**
 * @param {FlagValue} current
 * @param {ItemPF} item
 * @param {string} key
 * @param {string} label
 * @param {HTMLElement} parent,
 * @param {object} [o]
 * @param {string} [o.placeholder]
 */
export function textInput(
    current,
    item,
    key,
    label,
    parent, {
        placeholder = '',
    } = {}
) {
    const template = Handlebars.partials[templates.textInput]({ key, label, current, placeholder }, { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true });
    const div = document.createElement('div');
    div.innerHTML = template;
    const select = div.querySelector(`#text-input-${key}`);
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
