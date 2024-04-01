import { MODULE_NAME } from "../../../consts.mjs";
import { getTokenDisplayName } from "../../../util/get-token-display-name.mjs";
import { localizeBonusLabel, localizeBonusTooltip } from '../../../util/localize.mjs';
import { truthiness } from "../../../util/truthiness.mjs";
import { addNodeToRollBonus } from "../../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../../templates.mjs";
import { TokenSelectorApp } from "./token-selector-app.mjs";

/**
 * @param {object} args
 * @param {ItemPF} args.item,
 * @param {string} args.journal,
 * @param {string} args.key,
 * @param {string} [args.label]
 * @param {string} [args.tooltip]
 * @param {HTMLElement} args.parent
 * @param {object} options
 * @param {boolean} options.canEdit
 */
export function showTokenInput({
    item,
    journal,
    key,
    label = '',
    parent,
    tooltip = '',
}, {
    canEdit,
}) {
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);

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
        current,
        journal,
        label,
        readonly: !canEdit,
        tooltip,
    };
    const div = createTemplate(templates.editableIcons, templateData);

    div.querySelectorAll('li,a').forEach((element) => {
        element.addEventListener('click', (event) => {
            event.preventDefault();
            const options = { key };
            new TokenSelectorApp(item, options).render(true);
        });
    });

    addNodeToRollBonus(parent, div, item, canEdit);
}
