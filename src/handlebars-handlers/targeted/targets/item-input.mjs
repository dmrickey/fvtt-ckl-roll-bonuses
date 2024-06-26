import { MODULE_NAME } from "../../../consts.mjs";
import { api } from '../../../util/api.mjs';
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../../../util/localize.mjs";
import { truthiness } from "../../../util/truthiness.mjs";
import { uniqueArray } from "../../../util/unique-array.mjs";
import { addNodeToRollBonus } from "../../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../../templates.mjs";

/**
 * @param {object} args
 * @param {(item: ItemPF) => boolean} args.filter,
 * @param {ItemPF} args.item,
 * @param {string} args.journal,
 * @param {string} args.key,
 * @param {string} [args.label]
 * @param {HTMLElement} args.parent
 * @param {string} [args.tooltip]
 * @param {object} options
 * @param {boolean} options.canEdit
 */
export function showItemInput({
    filter,
    item,
    journal,
    key,
    label = '',
    parent,
    tooltip = '',
}, {
    canEdit,
}) {
    if (!item?.actor) return;

    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);

    /** @type {string[]} */
    const currentUuids = item.getFlag(MODULE_NAME, key) || [];
    const items = item.actor.items
        .filter(filter)
        .map(({ uuid, id, name, img, type }) => {
            const typeLabel = localize(CONFIG.Item.typeLabels[type]);
            return { uuid, id, name, img, type, typeLabel };
        });
    const current = item.actor.items.filter((i) => currentUuids.includes(i.uuid));

    const allItemUuids = items.map((i) => i.uuid);
    const badCurrentUuids = currentUuids.filter((c) => !allItemUuids.includes(c));
    const badCurrent = badCurrentUuids.map(fromUuidSync);

    const templateData = {
        badCurrent,
        current,
        journal,
        label,
        readonly: !canEdit,
        tooltip,
    };
    const div = createTemplate(templates.editableIcons, templateData);

    if (canEdit) {
        div.querySelectorAll('li,a').forEach((element) => {
            element.addEventListener('click', (event) => {
                event.preventDefault();
                const options = {
                    currentUuids,
                    items,
                    path: `flags.${MODULE_NAME}.${key}`,
                };
                new ItemSelector(item, options).render(true);
            });
        });
    }

    addNodeToRollBonus(parent, div, item, canEdit);
}

/** @ts-ignore */
/** @extends {DocumentSheet<ItemSelectorOptions, ItemPF>} */
class ItemSelector extends DocumentSheet {
    /** @override */
    static get defaultOptions() {
        const options = super.defaultOptions;

        options.height = 'auto';
        options.template = templates.itemsApp;
        options.title = localize('item-app.title');

        return options;
    }

    /**
     * @override
     * @param {JQuery} html
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('button[type=reset]')?.click(this.close.bind(this));
    }

    /** @override */
    async getData() {
        /** @type {{ item: ItemPF, path: string, groupedItems: {[key: string]: ItemSelectorOptions['items'][]} }} */
        const templateData = {
            item: this.object,
            path: this.options.path,
            groupedItems: {},
        };

        const items = this.options.items;
        items.forEach((item) => {
            item.checked = this.options.currentUuids.includes(item.uuid);
        });

        items.sort((a, b) => {
            const first = a.type.localeCompare(b.type);
            return first
                ? first
                : a.name.localeCompare(b.name);
        });

        const labels = uniqueArray(items.map(({ typeLabel }) => typeLabel));
        templateData.groupedItems = labels
            .reduce((acc, curr) => ({ ...acc, [curr]: items.filter(({ typeLabel }) => curr === typeLabel) }), {});

        return templateData;
    }

    /**
     * @override
     * @param {Record<string, unknown>} updateData
     * @returns
     */
    _getSubmitData(updateData) {
        const path = this.options.path;

        const formData = super._getSubmitData(updateData);
        formData[path] = Array.isArray(formData[path])
            ? formData[path]
            : [formData[path]];
        // @ts-ignore
        formData[path] = formData[path].filter(truthiness);

        const submitData = foundry.utils.expandObject(formData);
        return submitData;
    }
}

api.inputs.showItemInput = showItemInput;
