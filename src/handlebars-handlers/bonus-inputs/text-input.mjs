import { addNodeToRollBonus } from "../roll-bonus-on-actor-sheet.mjs";
import { templates } from "../init.mjs";

/**
 * @param {object} args
 * @param {FlagValue} args.current
 * @param {ItemPF} args.item
 * @param {string} args.key
 * @param {string} args.label
 * @param {HTMLElement} args.parent,
 * @param {object} [o]
 * @param {string} [o.placeholder]
 * @param {boolean} [o.notFormula]
 */
export function textInput({
    current,
    item,
    key,
    label,
    parent,
}, {
    placeholder = '',
    notFormula = false,
} = {}
) {
    const template = Handlebars.partials[templates.textInput](
        { key, label, current, notFormula, placeholder },
        { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true }
    );
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
