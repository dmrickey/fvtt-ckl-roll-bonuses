import { MODULE_NAME } from "../../../consts.mjs";
import { api } from '../../../util/api.mjs';
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../../../util/localize.mjs";
import { truthiness } from "../../../util/truthiness.mjs";
import { menu } from '../../../warpgate/menu.mjs';
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
 * @param {string[] | {[key: string]: string}} args.options
 * @param {HTMLElement} args.parent
 * @param {object} options
 * @param {boolean} options.canEdit
 * @param {InputType} options.inputType
 * @param {number} [options.limit] Maximum number of items that can be checked.
 */
export function showChecklist({
    description = '',
    item,
    journal,
    key,
    label = '',
    options,
    parent,
    tooltip = '',
}, {
    canEdit,
    inputType,
    limit = 0,
}) {
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);

    if (Array.isArray(options)) {
        options = options.reduce((acc, curr) => ({ ...acc, [curr]: curr }), {});
    }
    const current = item.getFlag(MODULE_NAME, key) || [];
    const templateData = {
        current,
        flag: key,
        journal,
        label,
        options,
        readonly: !canEdit,
        tooltip,
    };
    const div = createTemplate(templates.checklist, templateData);

    div.querySelectorAll('.trait-selector').forEach((element) => {
        element.addEventListener('click', async (event) => {
            event.preventDefault();

            /** @type {import('../../../warpgate/menu.mjs').MenuInput[]} */
            const inputs = Object.entries(options).map(([key, label]) => ({
                label,
                type: 'checkbox',
                options: current.includes(key),
                value: key,
            }));
            if (description) {
                inputs.push({
                    type: 'info',
                    label: description,
                });
            }
            const buttons = [
                { label: localize('Cancel'), value: false },
                { label: localize('ok'), value: true, },
            ];

            const results = await menu(
                { inputs, buttons },
                {
                    title: `${label} - ${item.name}`,
                    render: (/** @type {Array<HTMLElement>} */[contents]) => {
                        if (!limit) return;

                        const clazz = 'vt-checklist';
                        contents.classList.add(clazz);

                        const handleChecked = () => {
                            const checked = document.querySelectorAll(`.${clazz} input[type="checkbox"]:checked`);
                            if (checked.length >= limit) {
                                const unchecked = document.querySelectorAll(`.${clazz} input[type="checkbox"]:not(:checked)`);
                                unchecked.forEach((node) => node.setAttribute('disabled', ''));
                            }
                            else {
                                const all = document.querySelectorAll(`.${clazz} input[type="checkbox"]`);
                                all.forEach((node) => node.removeAttribute('disabled'));
                            }
                        }
                        handleChecked();

                        const all = document.querySelectorAll(`.${clazz} input[type="checkbox"]`);
                        all.forEach((node) => node.addEventListener('change', handleChecked));
                    },
                },
            );

            if (results.buttons) {
                const selected = results.inputs
                    .map((result, i) => result ? inputs[i].value : null)
                    .filter(truthiness);

                await item.setFlag(MODULE_NAME, key, selected);
            }
        });
    });

    addNodeToRollBonus(parent, div, item, canEdit, inputType);
}

api.inputs.showChecklist = showChecklist;
