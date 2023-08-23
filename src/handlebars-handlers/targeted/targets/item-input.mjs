import { MODULE_NAME } from "../../../consts.mjs";
import { localize } from "../../../util/localize.mjs";
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
                item,
                items,
                key,
            };
            new ItemSelector(options).render(true);
        });
    });

    addNodeToRollBonus(parent, div);
}

class ItemSelector extends FormApplication {
    /** @override */
    static get defaultOptions() {
        const options = super.defaultOptions;

        options.height = 'auto';
        options.template = templates.itemsApp;
        options.title = 'Item Selector'; // todo

        return options;
    }

    /**
     * @override
     * @returns
     */
    getData() {
        const data = super.getData();

        const templateData = { ...data.object };

        templateData.items.forEach((item) => {
            item.checked = templateData.currentUuids.includes(item.uuid);
        });

        templateData.items.sort((a, b) => {
            const first = a.type.localeCompare(b.type);
            return first
                ? first
                : a.name.localeCompare(b.name);
        })

        return templateData;
    }

    /** @override */
    async _updateObject(event, formData) {
        const checked = [...event.currentTarget.querySelectorAll('input')]
            .filter((node) => node.checked)
            .map((node) => node.dataset.uuid);
        const { item, key } = this.getData();
        await item.setFlag(MODULE_NAME, key, checked);
    }
}
