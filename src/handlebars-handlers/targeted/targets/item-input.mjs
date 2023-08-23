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
    const currentUuids = item.getFlag(MODULE_NAME, key) || [
        "Actor.Bw8oKHwi7mmTG4PD.Item.Dxdouxl0hLPCc57t",
        "Actor.Bw8oKHwi7mmTG4PD.Item.bTItuyekSVOmBh8S",
        "Actor.Bw8oKHwi7mmTG4PD.Item.oyq7cJD1QGh8YwaA",
        "Actor.Bw8oKHwi7mmTG4PD.Item.aKlryTgToNLtNVmb",
        "Actor.Bw8oKHwi7mmTG4PD.Item.cFBG5m5R4U62kItC",
        "Actor.Bw8oKHwi7mmTG4PD.Item.oUCPgCjpNACGPoYQ",
        "Actor.Bw8oKHwi7mmTG4PD.Item.sOqHp8vp0r9hSGnp",
        "Actor.Bw8oKHwi7mmTG4PD.Item.7hAXCo6sYfpIqeli",
        "Actor.Bw8oKHwi7mmTG4PD.Item.jYjQKhj6M0oVs94k",
        "Actor.Bw8oKHwi7mmTG4PD.Item.cWa9gqvSf3YQd1Wm",
        "Actor.Bw8oKHwi7mmTG4PD.Item.IjawwzL0DGCEMVZB",
        "Actor.Bw8oKHwi7mmTG4PD.Item.uGJgXIdG0wBT1ypq",
        "Actor.Bw8oKHwi7mmTG4PD.Item.MkFh6WG8EpmA6DrV",
        "Actor.Bw8oKHwi7mmTG4PD.Item.51ABKUiTUrq0peH8",
        "Actor.Bw8oKHwi7mmTG4PD.Item.Nu1EZCwXHxshp7pz",
        "Actor.Bw8oKHwi7mmTG4PD.Item.TilRpzOyXvySFbVg",
        "Actor.Bw8oKHwi7mmTG4PD.Item.bDyIl5M77UtHv5TI",
        "Actor.Bw8oKHwi7mmTG4PD.Item.tBxDVRH0Rf6pPbWa",
        "Actor.Bw8oKHwi7mmTG4PD.Item.fSYkPCinFcTdC787",
        "Actor.Bw8oKHwi7mmTG4PD.Item.QnoaCaYina4ki2RX",
        "Actor.Bw8oKHwi7mmTG4PD.Item.K46OgK18g95PjcVm",
        "Actor.Bw8oKHwi7mmTG4PD.Item.Mkxb8NGhYoHQzUnN"
    ];
    const items = item.actor.items
        .filter(filter)
        .map(({ uuid, id, name, img }) => ({ uuid, id, name, img }));
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
                parent,
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
        options.id = 'item-selector';
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

        // todo filter item types
        // Attack, Inventory, Buffs, Spells

        templateData.items.forEach((item) => {
            item.checked = templateData.currentUuids.includes(item.uuid);
        });

        return templateData;
    }

    /** @override */
    async _updateObject(event, formData) {
        const checked = [...event.currentTarget.querySelectorAll('input')]
            .filter((node) => node.checked)
            .map((node) => node.dataset.itemId);
        const { item, key } = this.getData();
        await item.setFlag(MODULE_NAME, key, checked);
    }
}
