import { MODULE_NAME } from "../../../consts.mjs";
import { getTokenDisplayName } from "../../../util/get-token-display-name.mjs";
import { truthiness } from "../../../util/truthiness.mjs";
import { addNodeToRollBonus } from "../../roll-bonus-on-item-sheet.mjs";
import { createTemplate, templates } from "../../templates.mjs";
import { TokenSelectorApp } from "./token-selector-app.mjs";

/**
 * @param {object} args
 * @param {ItemPF} args.item,
 * @param {string} args.key,
 * @param {string} args.label,
 * @param {HTMLElement} args.parent
 */
export function showTokenInput({
    item,
    key,
    label,
    parent,
}) {
    /** @type {string[]} */
    const savedTargets = item.getFlag(MODULE_NAME, key) || [];
    const current = savedTargets
        .map((uuid) => fromUuidSync(uuid))
        .filter(truthiness)
        .map((token) => ({
            img: token.texture.src,
            name: getTokenDisplayName(token),
            id: token.id,
        }));

    const templateData = {
        label,
        current,
    };
    const div = createTemplate(templates.editableIcons, templateData);

    div.querySelectorAll('li,a').forEach((element) => {
        element.addEventListener('click', (event) => {
            event.preventDefault();
            const options = { key };
            new TokenSelectorApp(item, options).render(true);
        });
    });

    addNodeToRollBonus(parent, div, item);
}
