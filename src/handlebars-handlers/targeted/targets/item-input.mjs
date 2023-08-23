import { MODULE_NAME } from "../../../consts.mjs";
import { localize } from "../../../util/localize.mjs";
import { truthiness } from "../../../util/truthiness.mjs";
import { addNodeToRollBonus } from "../../roll-bonus-on-actor-sheet.mjs";
import { createTemplate, templates } from "../../templates.mjs";

/**
 *
 * @param {object} args
 * @param {ItemPF} args.item,
 * @param {(item: ItemPF) => boolean} args.filter,
 * @param {string} args.key,
 * @param {HTMLElement} args.parent
 */
export function showItemInput({
    item,
    filter,
    key,
    parent,
}) {
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
        label: localize('PF1.Items'),
        current,
        badCurrent,
    };
    const div = createTemplate(templates.items, templateData);

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

    addNodeToRollBonus(parent, div);
}

/** @extends {DocumentSheet<ItemSelectorOptions, ItemPF>} */
class ItemSelector extends DocumentSheet {
    /** @override */
    static get defaultOptions() {
        const options = super.defaultOptions;

        options.height = 'auto';
        options.template = templates.itemsApp;
        options.title = 'Item Selector'; // todo localize

        return options;
    }

    /** @override */
    getData() {
        const templateData = {
            currentUuids: this.options.currentUuids,
            item: this.object,
            items: this.options.items,
            path: this.options.path,
        };

        templateData.items.forEach((item) => {
            item.checked = templateData.currentUuids.includes(item.uuid);
        });

        templateData.items.sort((a, b) => {
            const first = a.type.localeCompare(b.type);
            return first
                ? first
                : a.name.localeCompare(b.name);
        });

        return templateData;
    }

    /** @override */
    _getSubmitData(updateData) {
        const path = this.options.path;

        const formData = super._getSubmitData(updateData);
        formData[path] = Array.isArray(formData[path])
            ? formData[path]
            : [formData[path]];
        formData[path] = formData[path].filter(truthiness);

        const submitData = foundry.utils.expandObject(formData);
        return submitData;
    }
}
