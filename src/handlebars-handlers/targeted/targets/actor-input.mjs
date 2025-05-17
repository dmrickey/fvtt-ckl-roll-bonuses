import { MODULE_NAME } from "../../../consts.mjs";
import { api } from '../../../util/api.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../../../util/localize.mjs';
import { truthiness } from "../../../util/truthiness.mjs";
import { addNodeToRollBonus } from "../../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../../templates.mjs";
import { ActorSelectorApp } from './actor-select-app.mjs';

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
 * @param {boolean} [options.isSubLabel]
 */
export function showActorInput({
    item,
    journal,
    key,
    label = '',
    parent,
    tooltip = '',
}, {
    canEdit,
    isSubLabel = false,
}) {
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);

    /**
     * @param {string} uuid
     * @returns {ActorPF}
     */
    const getActor = (uuid) => fromUuidSync(uuid);

    /** @type {string[]} */
    const savedTargets = item.getFlag(MODULE_NAME, key) || [];
    const current = savedTargets
        .map((uuid) => getActor(uuid))
        .filter(truthiness)
        .map((actor) => ({
            img: actor.thumbnail,
            name: actor.name,
            id: actor.id,
            uuid: actor.uuid,
        }));

    const templateData = {
        current,
        isSubLabel,
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
                new ActorSelectorApp(item, options).render(true);
            });
        });
    }
    div.querySelectorAll('li').forEach((element) => {
        element.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            // @ts-ignore
            const /** @type {HTMLElement?} */ target = event.target;

            let parent = target;
            while (parent && !parent.dataset.uuid) { parent = parent.parentElement }

            const uuid = parent?.dataset.uuid;
            if (uuid) {
                /** @type {ActorPF} */
                const actor = fromUuidSync(uuid);
                if (actor?.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER)) {
                    actor.sheet.render(true);
                }
            }
        });
    });

    addNodeToRollBonus(parent, div, item, canEdit, 'target');
}

api.inputs.showActorInput = showActorInput;
