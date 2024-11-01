import { MODULE_NAME } from "../../../consts.mjs";
import { api } from '../../../util/api.mjs';
import { confirmationDialog } from '../../../util/confirmation-dialog.mjs';
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../../../util/localize.mjs";
import { addNodeToRollBonus } from "../../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../../templates.mjs";

/**
 * @param {object} [args]
 * @param {string} [args.category]
 * @param {string} [args.id]
 * @param {string} [args.name]
 * @param {'script' | 'macro'} [args.type]
 * @param {string} [args.value]
 * @return {Partial<ItemScriptCallData> & {value: ItemScriptCallData['value']}}
 */
const createScriptCallData = ({ category, id, name, type, value } = {}) => {
    category ||= 'use';
    name = name?.trim() ? name.trim() : localize('script-call-default-name');
    type ||= 'script';
    value ||= '';
    return {
        _id: id || foundry.utils.randomID(),
        category,
        name,
        type,
        value,
    }
};

/**
 * @param {string} uuid
 * @return {Partial<ItemScriptCallData> & {value: ItemScriptCallData['value']}}
 */
const createScriptCallDataFromMacro = (uuid) => {
    const macro = fromUuidSync(uuid);
    if (!macro) return createScriptCallData();

    return {
        _id: foundry.utils.randomID(),
        category: 'use',
        name: macro.name,
        type: 'macro',
        value: uuid,
    }
};

/**
 * @param {object} args
 * @param {string} args.key
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
    item,
    journal,
    key,
    parent,
    label = '',
    tooltip = '',
}, {
    canEdit,
    inputType,
}) {
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);

    const categories = pf1.registry.scriptCalls
        .map((sc) => ({
            key: sc._id,
            label: sc.name,
        }));

    /** @type {(Partial<ItemScriptCallData> & {value: ItemScriptCallData['value']})[]} */
    const saved = item.getFlag(MODULE_NAME, key);
    /** @type {(Partial<ItemScriptCallData> & {value: ItemScriptCallData['value']})[]} */
    const scripts = saved
        ? saved.map((c) => c.type === 'macro' ? createScriptCallDataFromMacro(c.value) : c)
        : [];
    if (!scripts.length) {
        scripts.push(createScriptCallData());
    }

    const templateData = {
        categories,
        journal,
        label,
        readonly: !canEdit,
        scripts,
        tooltip,
    };
    const div = createTemplate(templates.scriptCallBonus, templateData);

    div.addEventListener('drop', async (event) => {
        event.preventDefault();

        /** @type {{ type: string, uuid: string }} */ //@ts-ignore
        const data = JSON.parse(event.dataTransfer.getData("text/plain"));
        if (!data) return;

        if (data.type === 'Macro' && data.uuid) {
            const macro = fromUuidSync(data.uuid);
            if (macro) {
                const created = createScriptCallData({
                    value: data.uuid,
                    name: macro.name,
                    type: 'macro',
                });
                scripts.push(created);
                await item.setFlag(MODULE_NAME, key, scripts);
                return;
            }
        }
    });

    div.querySelectorAll('.edit-script').forEach((element) => {
        element.addEventListener('click', async (event) => {
            event.preventDefault();

            const clicked = /** @type {HTMLElement} */ (event.currentTarget);
            /** @type {HTMLDataListElement | null} */
            const row = clicked.closest('.script-row');
            if (!row) return;

            const index = +(row.dataset.index || 0);
            const current = scripts[index];

            if (current.type === 'script') {
                const scriptEditor = new pf1.applications.ScriptEditor({
                    command: current.value,
                    name: current.name,
                    parent: { uuid: foundry.utils.randomID(), isOwner: !!canEdit },
                    script: current._id,
                    scriptCall: true,
                })
                    .render(true, { editable: canEdit });

                const result = await scriptEditor.awaitResult();
                if (result) {
                    const updated = createScriptCallData({
                        category: current.category,
                        id: current._id,
                        type: current.type,
                        value: result.command,
                        name: result.name,
                    });
                    scripts[index] = updated;
                    await item.setFlag(MODULE_NAME, key, scripts);
                    return;
                }
            }
            else {
                /** @type {Macro | undefined} */
                const macro = fromUuidSync(current.value);
                if (macro) {
                    confirmationDialog({
                        title: localize('script-call-dialog.edit-macro-title', { name: macro.name }),
                        message: localize('script-call-dialog.edit-macro-message'),
                        confirmCallback: () => macro?.sheet.render(true),
                    });
                }
            }
        });
    });

    div.querySelectorAll('.category-select').forEach((select) => {
        select?.addEventListener(
            'change',
            async (event) => {
                const target = /** @type {HTMLTextAreaElement} */ (event.target);
                if (!target?.value) return;

                const clicked = /** @type {HTMLElement} */ (event.currentTarget);
                /** @type {HTMLDataListElement | null} */
                const row = clicked.closest('.script-row');
                if (!row) return;

                const index = +(row.dataset.index || 0);
                if (scripts[index]) {
                    scripts[index].category = target.value;
                    await item.setFlag(MODULE_NAME, key, scripts);
                }
            },
        );
    });

    const createButton = div.querySelector('.add-script');
    createButton?.addEventListener(
        'click',
        async (event) => {
            scripts.push(createScriptCallData());
            await item.setFlag(MODULE_NAME, key, scripts);
        }
    );

    div.querySelectorAll('.delete-script').forEach((select) => {
        select?.addEventListener(
            'click',
            async (event) => {
                const clicked = /** @type {HTMLElement} */ (event.currentTarget);
                /** @type {HTMLDataListElement | null} */
                const row = clicked.closest('.script-row');
                if (!row) return;

                const index = +(row.dataset.index || 0);
                if (scripts[index]) {
                    const deleteScript = async () => {
                        const clonedScripts = deepClone(scripts);
                        clonedScripts.splice(index, 1);
                        await item.setFlag(MODULE_NAME, key, clonedScripts);
                    }

                    scripts[index].value?.trim()
                        ? confirmationDialog({
                            title: localize('script-call-dialog.delete-script-title', { name: scripts[index].name }),
                            message: localize('script-call-dialog.delete-script-message'),
                            confirmCallback: () => deleteScript(),
                        })
                        : deleteScript();
                }
            },
        );
    });

    addNodeToRollBonus(parent, div, item, canEdit, inputType);
}

api.inputs.showScriptBonusEditor = showScriptBonusEditor;
