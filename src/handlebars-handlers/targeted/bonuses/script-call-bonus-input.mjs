import { MODULE_NAME } from "../../../consts.mjs";
import { api } from '../../../util/api.mjs';
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../../../util/localize.mjs";
import { addNodeToRollBonus } from "../../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../../templates.mjs";

/**
 * @param {object} args
 * @param {string} args.bonusKey
 * @param {{key: string, label: string}[]} args.categories
 * @param {string} args.categoryKey
 * @param {ItemPF} args.item
 * @param {string} args.journal
 * @param {string} [args.label]
 * @param {string} [args.tooltip]
 * @param {HTMLElement} args.parent
 * @param {object} options
 * @param {boolean} options.canEdit
 * @param {InputType} options.inputType
 */
export function showScriptBonusEditor({
    categories,
    item,
    journal,
    bonusKey,
    categoryKey,
    parent,
    label = '',
    tooltip = '',
}, {
    canEdit,
    inputType,
}) {
    label ||= localizeBonusLabel(bonusKey);
    tooltip ||= localizeBonusTooltip(bonusKey);

    const currentCategory = item.getFlag(MODULE_NAME, categoryKey);
    if (canEdit) {
        if ((categories.length && (!currentCategory || !categories.some((c) => c.key === currentCategory)))
            || (categories.length === 1 && currentCategory !== categories[0].key)
        ) {
            item.setFlag(MODULE_NAME, categoryKey, categories[0].key);
        }
        else if (!categories.length && currentCategory) {
            item.setFlag(MODULE_NAME, categoryKey, '');
        }
    }

    /** @type {Partial<ItemScriptCallData>} */
    const current = {
        ...(item.getFlag(MODULE_NAME, bonusKey) || {
            _id: foundry.utils.randomID(),
            command: '',
            name: localize('script-call-default-name'),
        })
    };

    // @ts-ignore
    current.parent = { uuid: foundry.utils.randomID(), isOwner: !!canEdit };
    // @ts-ignore
    current.script = current._id;
    // @ts-ignore
    current.scriptCall = true;

    const templateData = {
        categories,
        current,
        currentCategory,
        flag: bonusKey,
        journal,
        label,
        readonly: !canEdit,
        tooltip,
    };
    const div = createTemplate(templates.scriptCallBonus, templateData);

    div.querySelectorAll('.trait-selector').forEach((element) => {
        element.addEventListener('click', async (event) => {
            event.preventDefault();

            const scriptEditor = new pf1.applications.ScriptEditor(current).render(true, { editable: canEdit });

            const result = await scriptEditor.awaitResult();
            if (result) {
                await item.setFlag(MODULE_NAME, bonusKey, {
                    _id: current._id,
                    ...result,
                    name: result.name?.trim() || localize('script-call-default-name'),
                });
                return;
            }
        });
    });
    const select = div.querySelector(`#key-value-selector-${categoryKey}`);
    select?.addEventListener(
        'change',
        async (event) => {
            if (!categoryKey) return;

            // @ts-ignore - event.target is HTMLTextAreaElement
            const /** @type {HTMLTextAreaElement} */ target = event.target;
            await item.setFlag(MODULE_NAME, categoryKey, target?.value);
        },
    );

    addNodeToRollBonus(parent, div, item, canEdit, inputType);
}

api.inputs.showScriptBonusEditor = showScriptBonusEditor;
