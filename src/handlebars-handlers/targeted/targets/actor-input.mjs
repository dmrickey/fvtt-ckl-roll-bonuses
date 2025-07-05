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
 * @param {InputType} [options.inputType]
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
    inputType = 'target'
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
                const options = { current: current.map(x => x.uuid), key };
                new ActorSelectorApp(item, options).render(true);
            });
        });
    }

    div.querySelectorAll('li[data-uuid]').forEach((element) => {
        const li = /** @type {HTMLDataListElement} */ (element);

        const uuid = li.dataset.uuid;
        if (uuid) {
            /** @type {ActorPF} */
            const actor = fromUuidSync(uuid);

            const tokens = actor?.getActiveTokens() ?? [];
            tokens.forEach((token) => {
                li.addEventListener('pointerenter', (e) => token._onHoverIn(e, { hoverOutOthers: false }));
                li.addEventListener('pointerleave', (e) => token._onHoverOut(e));
            });

            if (actor?.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER)) {
                element.addEventListener('contextmenu', (event) => {
                    event.preventDefault();
                    actor.sheet.render(true);
                });
            }
        }
    });

    addNodeToRollBonus(parent, div, item, canEdit, inputType);
}

api.inputs.showActorInput = showActorInput;
