import { MODULE_NAME } from "../../../consts.mjs";
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../../../util/localize.mjs";
import { truthiness } from "../../../util/truthiness.mjs";
import { addNodeToRollBonus } from "../../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../../templates.mjs";

/**
 * @param {object} args
 * @param {string} args.journal
 * @param {string} args.key
 * @param {ItemPF} args.item
 * @param {string} [args.label]
 * @param {string} [args.tooltip]
 * @param {string[] | {[key: string]: string}} args.options
 * @param {HTMLElement} args.parent
 * @param {object} options
 * @param {boolean} options.canEdit
 */
export function showChecklist({
    item,
    journal,
    key,
    label = '',
    options,
    parent,
    tooltip = '',
}, {
    canEdit,
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
    const div = createTemplate(templates.checkedItems, templateData);

    div.querySelectorAll('.trait-selector').forEach((element) => {
        element.addEventListener('click', async (event) => {
            event.preventDefault();

            const ok = localize('ok');
            const inputs = Object.entries(options).map(([key, label]) => ({
                label,
                type: 'checkbox',
                options: current.includes(key),
                value: key,
            }));
            const buttons = [
                { label: localize('ok'), value: true, },
                { label: localize('PF1.Cancel'), value: false },
            ];

            const results = await warpgate.menu(
                { inputs, buttons },
                { title: `${label} - ${item.name}`, },
            );

            if (results.buttons) {
                const selected = results.inputs
                    .map((result, i) => result ? inputs[i].value : null)
                    .filter(truthiness);

                await item.setFlag(MODULE_NAME, key, selected);
            }
        });
    });

    addNodeToRollBonus(parent, div, item, canEdit);
}
