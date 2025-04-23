import { MODULE_NAME } from "../../../consts.mjs";
import { api } from '../../../util/api.mjs';
import { confirmationDialog } from '../../../util/confirmation-dialog.mjs';
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../../../util/localize.mjs";
import { addNodeToRollBonus } from "../../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../../templates.mjs";

/**
 * @typedef {Partial<ItemScriptCallData> & {value: ItemScriptCallData['value']}} ScriptBonusData
 */

/**
 * @param {object} [args]
 * @param {string} [args.category]
 * @param {string} [args.id]
 * @param {string} [args.name]
 * @param {'script' | 'macro'} [args.type]
 * @param {string} [args.value]
 * @return {ScriptBonusData}
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
 * @param {ScriptBonusData} data
 * @return {ScriptBonusData}
 */
const createScriptCallDataFromMacro = (data) => {
    const macro = fromUuidSync(data?.value);
    if (!macro) return createScriptCallData();

    return {
        _id: foundry.utils.randomID(),
        category: data.category || 'use',
        name: macro.name,
        type: 'macro',
        value: data.value,
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

    /** @type {(ScriptBonusData)[]} */
    const saved = item.getFlag(MODULE_NAME, key);
    /** @type {(ScriptBonusData)[]} */
    const scripts = saved
        ? saved.map((c) => c.type === 'macro' ? createScriptCallDataFromMacro(c) : c)
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
        event.stopPropagation();

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
                const scriptEditor = await new pf1.applications.ScriptEditor({
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
                        confirmCallback: async () => {
                            const macro = await fromUuid(current.value);
                            macro?.sheet.render(true);
                        },
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

    const copyButton = div.querySelector('.copy-script');
    copyButton?.addEventListener(
        'click',
        async (event) => {
            const clicked = /** @type {HTMLElement} */ (event.currentTarget);
            /** @type {HTMLDataListElement | null} */
            const row = clicked.closest('.script-row');
            if (!row) return;

            const index = +(row.dataset.index || 0);
            const script = scripts[index];
            if (script) {
                const copy = foundry.utils.deepClone(script);
                copy.name = `${copy.name} ${localize('PF1.Copy')}`;
                scripts.push(copy);
                await item.setFlag(MODULE_NAME, key, scripts);
            }
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
                const script = scripts[index];
                if (script) {
                    const deleteScript = async () => {
                        const clonedScripts = foundry.utils.deepClone(scripts);
                        clonedScripts.splice(index, 1);
                        await item.setFlag(MODULE_NAME, key, clonedScripts);
                    }

                    (script?.type !== 'script' || !script.value?.trim())
                        ? deleteScript()
                        : confirmationDialog({
                            title: localize('script-call-dialog.delete-script-title', { name: script.name }),
                            message: localize('script-call-dialog.delete-script-message'),
                            confirmCallback: () => deleteScript(),
                        });
                }
            },
        );
    });

    addNodeToRollBonus(parent, div, item, canEdit, inputType);
}

api.inputs.showScriptBonusEditor = showScriptBonusEditor;
