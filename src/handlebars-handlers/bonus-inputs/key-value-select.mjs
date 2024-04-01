import { MODULE_NAME } from '../../consts.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../../util/localize.mjs';
import { addNodeToRollBonus } from "../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../templates.mjs";

/**
 * @param {object} args
 * @param {{key: string, label: string}[] | {[key: string]: string}} args.choices
 * @param {FlagValue} [args.current]
 * @param {ItemPF} args.item
 * @param {string} args.journal
 * @param {string} args.key
 * @param {string} [args.label]
 * @param {string} [args.tooltip]
 * @param {HTMLElement} args.parent,
 * @param {object} [options]
 * @param {boolean} [options.canEdit] - true (default)
 * @param {boolean} [options.isModuleFlag] - false (default) if this is a dictionary flag, true if this is a data flag
 */
export function keyValueSelect({
    choices,
    current,
    item,
    journal,
    key,
    label = '',
    parent,
    tooltip = '',
}, {
    canEdit = true,
    isModuleFlag = false,
} = {}) {
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);
    current ||= isModuleFlag
        ? item.getFlag(MODULE_NAME, key)
        : item.getItemDictionaryFlag(key);

    if (!Array.isArray(choices)) {
        choices = Object.entries(choices).map(([k, v]) => ({ key: k, label: v }));
    }

    if (canEdit) {
        if ((!current && choices.length) || (choices.length === 1 && current !== choices[0].key)) {
            isModuleFlag
                ? item.setFlag(MODULE_NAME, key, choices[0].key)
                : item.setItemDictionaryFlag(key, choices[0].key);
        }
    }

    const div = createTemplate(
        templates.keyValueSelect,
        {
            choices,
            current,
            journal,
            key,
            label,
            readonly: !canEdit,
            tooltip,
        },
    );
    const select = div.querySelector(`#key-value-selector-${key}`);
    select?.addEventListener(
        'change',
        async (event) => {
            if (!key) return;

            // @ts-ignore - event.target is HTMLTextAreaElement
            const /** @type {HTMLTextAreaElement} */ target = event.target;
            isModuleFlag
                ? await item.setFlag(MODULE_NAME, key, target?.value)
                : await item.setItemDictionaryFlag(key, target?.value);
        },
    );

    addNodeToRollBonus(parent, div, item, canEdit);
}
