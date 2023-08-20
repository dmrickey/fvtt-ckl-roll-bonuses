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
    const currentUuids = item.getFlag(MODULE_NAME, key) || ['Actor.Bw8oKHwi7mmTG4PD.Item.WNthPLMILePesCjj'];
    const items = item.actor.items.filter(filter);
    // todo show items that don't exist here.

    const templateData = {
        label: localize('PF1.Items'),
        currentUuids,
    };
    const div = createTemplate(templates.items, templateData);

    // todo update selector after UI is updated
    div.querySelectorAll('li').forEach((element) => {
        element.addEventListener('click', (event) => {
            event.preventDefault();

            const options = {
                currentUuids,
                item,
                items,
                key,
                parent,
            }
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
     * @param {object} args
     * @param {Partial<ItemPF>[]} args.items
     * @param {ItemPF[]} args.item
     * @param {HTMLElement[]} args.parent
     * @param {string[]} args.currentUuids
     * @param {string} args.key
     * @returns
     */
    getData(args) {
        const data = super.getData();

        const templateData = { ...data.object };

        // todo filter item types
        // Attack, Inventory, Buffs, Spells

        return templateData;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        // // Handle swapping out the icon on-change
        // html.find('li input:nth-of-type(2)').change(configIconUpdate)
        // // Handle swapping out the hover text on-change
        // html.find('li input:nth-of-type(1)').change(configTextUpdate)
        // // Handle deleting the row
        // html.find('li a .fa-trash').click(ev => ev.target.parentElement.parentElement.remove())
        // // Handle resetting the window
        // html.find('#reset-actions').click(() => this.render(true)) // Only kinda partially working
        // html.find('.add-row').click(ev => {
        //     let currentcount = html[0].querySelectorAll(".action").length
        //     let new_row = $(`<li class="action form-group"><i class="fa-solid fa-question"></i><input name="choices.${currentcount}.label" class="label-text" type="text"/><input name="choices.${currentcount}.icon" class="icon-text" type="text"/><a><i class="fa-solid fa-trash" data-tooltip="Delete"></i></a></li>`)
        //     new_row.insertBefore(ev.currentTarget)
        //     new_row.find('.icon-text').change(configIconUpdate)
        //     html.find('.label-text').change(configTextUpdate)
        //     new_row.find('a .fa-trash').click(ev => ev.target.parentElement.parentElement.remove())
        // })
    }

    /** @override */
    async _updateObject(event, formData) {
        // game.settings.set('ooct','choices',
        //     Object.values(expandObject(formData)?.choices ?? {0:{'label':'Undecided', 'icon': 'fa-question'}}).filter(c => c.icon&&c.label)
        // )
    }
}
