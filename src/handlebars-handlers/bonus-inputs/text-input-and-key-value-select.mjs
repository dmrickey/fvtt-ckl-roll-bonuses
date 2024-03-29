import { addNodeToRollBonus } from "../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../templates.mjs";
import { localize, localizeBonusLabel } from "../../util/localize.mjs";

/**
 * @param {object} args
 * @param {{current: FlagValue, key: string, placeholder?: string}} args.text
 * @param {{current: FlagValue, key: string, choices: {key: string, label: string}[]}} args.select
 * @param {ItemPF} args.item
 * @param {string} [args.label]
 * @param {HTMLElement} args.parent
 */
export function textInputAndKeyValueSelect({
    item,
    label = '',
    parent,
    select,
    text,
}) {
    label ||= localizeBonusLabel(select.key);

    if ((!select.current && select.choices.length) || (select.choices.length === 1 && select.current !== select.choices[0].key)) {
        item.setItemDictionaryFlag(select.key, select.choices[0].key);
    }

    const div = createTemplate(
        templates.textInputAndKeyValueSelect,
        {
            choices: select.choices,
            current: select.current,
            formula: text.current,
            selectKey: select.key,
            textKey: text.key,
            label,
            placeholder: text.placeholder || localize('PF1.Formula'),
        },
    );

    const input = div.querySelector(`#text-input-${text.key}`);
    input?.addEventListener(
        'change',
        async (event) => {
            // @ts-ignore - event.target is HTMLTextAreaElement
            const /** @type {HTMLTextAreaElement} */ target = event.target;
            await item.setItemDictionaryFlag(text.key, target?.value);
        },
    );

    const selector = div.querySelector(`#key-value-selector-${select.key}`);
    selector?.addEventListener(
        'change',
        async (event) => {
            // @ts-ignore - event.target is HTMLTextAreaElement
            const /** @type {HTMLTextAreaElement} */ target = event.target;
            await item.setItemDictionaryFlag(select.key, target?.value);
        },
    );

    addNodeToRollBonus(parent, div, item);
}
