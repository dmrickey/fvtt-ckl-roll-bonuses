import { MODULE_NAME } from "../../../consts.mjs";
import { api } from '../../../util/api.mjs';
import { getTokenDisplayName } from "../../../util/get-token-display-name.mjs";
import { localizeBonusLabel, localizeBonusTooltip } from '../../../util/localize.mjs';
import { truthiness } from "../../../util/truthiness.mjs";
import { addNodeToRollBonus } from "../../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../../templates.mjs";
import { TokenSelectorApp } from "./token-select-app.mjs";

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

    /**
     * @param {string} uuid
     * @returns {TokenDocumentPF}
     */
    const getToken = (uuid) => fromUuidSync(uuid);

    /** @type {string[]} */
    const savedTargets = item.getFlag(MODULE_NAME, key) || [];
    const current = savedTargets
        .map((uuid) => getToken(uuid))
        .filter(truthiness)
        .map((token) => ({
            img: token.texture.src,
            name: getTokenDisplayName(token),
            id: token.id,
            uuid: token.uuid,
        }));

    const templateData = {
        current,
        journal,
        label,
        readonly: !canEdit,
        tooltip,
    };
    const div = createTemplate(templates.editableIcons, templateData);

    if (canEdit) {
        div.querySelectorAll('li,a.trait-selector,.error-text').forEach((element) => {
            element.addEventListener('click', (event) => {
                event.preventDefault();
                const options = { key };
                new TokenSelectorApp(item, options).render(true);
            });
        });
    }

    div.querySelectorAll('li[data-uuid]').forEach((element) => {
        const li = /** @type {HTMLDataListElement} */ (element);

        const uuid = li.dataset.uuid;
        if (uuid) {
            /** @type {TokenDocumentPF} */
            const doc = fromUuidSync(uuid);

            const token = doc?.object;
            if (token) {
                li.addEventListener('pointerenter', (e) => token._onHoverIn(e, { hoverOutOthers: false }));
                li.addEventListener('pointerleave', (e) => token._onHoverOut(e));
            }

            if (doc?.actor?.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER)) {
                li.addEventListener('contextmenu', (event) => {
                    event.preventDefault();
                    doc.actor?.sheet.render(true);
                });
            }
        }
    });

    addNodeToRollBonus(parent, div, item, canEdit, 'target');
}

api.inputs.showTokenInput = showTokenInput;
