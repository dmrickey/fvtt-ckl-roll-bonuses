import { MODULE_NAME } from "../../../consts.mjs";
import { api } from '../../../util/api.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from "../../../util/localize.mjs";
import { addNodeToRollBonus } from "../../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../../templates.mjs";

/**
 * @param {object} args
 * @param {string} [args.description]
 * @param {string} args.journal
 * @param {string} args.key
 * @param {ItemPF} args.item
 * @param {string} [args.label]
 * @param {string} [args.tooltip]
 * @param {HTMLElement} args.parent
 * @param {object} options
 * @param {boolean} options.canEdit
 * @param {InputType} options.inputType
 */
export function showScriptBonusEditor({
    description = '',
    item,
    journal,
    key,
    label = '',
    parent,
    tooltip = '',
}, {
    canEdit,
    inputType,
}) {
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);

    /** @type {Partial<ItemScriptCallData>} */
    const current = {
        ...(item.getFlag(MODULE_NAME, key) || {
            _id: foundry.utils.randomID(),
            command: '',
            name: '',
        })
    };

    // @ts-ignore
    current.parent = { uuid: foundry.utils.randomID(), isOwner: !!canEdit };
    // @ts-ignore
    current.script = current._id;
    // @ts-ignore
    current.scriptCall = true;

    const templateData = {
        current,
        flag: key,
        journal,
        label,
        readonly: !canEdit,
        tooltip,
    };
    const div = createTemplate(templates.checklist, templateData);

    div.querySelectorAll('.trait-selector').forEach((element) => {
        element.addEventListener('click', async (event) => {
            event.preventDefault();

            const scriptEditor = new pf1.applications.ScriptEditor(current).render(true, { editable: canEdit });

            const result = await scriptEditor.awaitResult();
            if (result) {
                await item.setFlag(MODULE_NAME, key, { _id: current._id, ...result });
                return;
            }
        });
    });

    addNodeToRollBonus(parent, div, item, canEdit, inputType);
}

api.inputs.showScriptBonusEditor = showScriptBonusEditor;
