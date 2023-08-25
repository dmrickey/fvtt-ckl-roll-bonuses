import { MODULE_NAME } from "../../consts.mjs";
import { addNodeToRollBonus } from "../roll-bonus-on-actor-sheet.mjs";
import { createTemplate, templates } from "../templates.mjs";

/**
 * @param {object} args
 * @param {boolean} [args.isFormula]
 * @param {ItemPF} args.item
 * @param {string} args.key
 * @param {string} args.label
 * @param {HTMLElement} args.parent
 */
export function textListInput({
    isFormula = true,
    item,
    key,
    label,
    parent,
}) {
    let /** @type {string[]} */ current = item.getFlag(MODULE_NAME, key) || [''];
    const templateData = { current, isFormula, label };
    const div = createTemplate(
        templates.textInputList,
        templateData,
    );

    div.querySelectorAll('input[type=text]').forEach((element) => {
        element.addEventListener('change', async (event) => {
            event.preventDefault();
            // @ts-ignore - event.target is HTMLTextAreaElement
            const /** @type {HTMLTextAreaElement} */ target = event.target;
            const updatedFormula = target?.value;

            // Check for normal damage part
            const index = +(target?.closest("li")?.dataset.index ?? -1);
            if (index > -1) {
                const path = `${index}`;

                setProperty(current, path, updatedFormula);
                await item.setFlag(MODULE_NAME, key, current);
            }
        });
    });

    div.querySelectorAll('.delete-row').forEach((element) => {
        element.addEventListener('click', async (event) => {
            // @ts-ignore - event.target is HTMLAnchorElement
            const /** @type {HTMLAnchorElement} */ target = event.currentTarget;
            const index = +(target?.closest("li")?.dataset.index ?? -1);
            if (index > -1) {
                if (current.length === 1) {
                    current = [''];
                }
                else {
                    current.splice(index);
                }
                await item.setFlag(MODULE_NAME, key, current);
            }
        });
    });

    addNodeToRollBonus(parent, div);
}
