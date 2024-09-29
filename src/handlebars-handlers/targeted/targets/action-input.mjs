import { MODULE_NAME } from "../../../consts.mjs";
import { api } from '../../../util/api.mjs';
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../../../util/localize.mjs";
import { truthiness } from "../../../util/truthiness.mjs";
import { uniqueArray } from "../../../util/unique-array.mjs";
import { addNodeToRollBonus } from "../../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../../templates.mjs";

/**
 * @typedef {object} ActionSelectorOptions
 * @property {string} path
 * @property {ItemOptionData[]} items
 */

/**
 * @typedef {object} ItemOptionData
 * @property {string} id
 * @property {string} name
 * @property {string} img
 * @property {string} type
 * @property {string} typeLabel
 * @property {ActionOptionData[]} actions
 */

/**
 * @typedef {object} ActionOptionData
 * @property {string} id
 * @property {string} name
 * @property {string} img
 * @property {boolean} checked
 */

/**
 * @param {object} args
 * @param {ItemPF} args.item,
 * @param {string} args.journal,
 * @param {string} args.key,
 * @param {string} [args.label]
 * @param {HTMLElement} args.parent
 * @param {string} [args.tooltip]
 * @param {object} options
 * @param {boolean} options.canEdit
 */
export function showActionInput({
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

    const currentIds = (/** @type {[String, string]} */ (item.getFlag(MODULE_NAME, key) || []))
        .map((x) => x.split('.'))
        .filter(([itemId, actionId]) => truthiness(itemId) && truthiness(actionId));

    /** @type {unknown[]} */
    const current = [];
    const items = item.actor.items
        .filter(x => x.hasAction)
        .map((loopItem) => {

            const typeLabel = localize(CONFIG.Item.typeLabels[loopItem.type]);
            const hasAction = (/** @type {string} */ actionId) => currentIds.some(([iId, aId]) => loopItem.id === iId && actionId === aId);

            return {
                id: loopItem.id,
                name: loopItem.name,
                img: loopItem.img,
                type: loopItem.type,
                typeLabel,
                actions: loopItem.actions.map(({ id, name, img }) => {
                    const checked = hasAction(id);
                    const value = { checked, id, name, img };
                    if (checked) {
                        current.push({ name: `${loopItem.name} - ${name}`, img });
                    }
                    return value;
                }),
            };
        });

    const templateData = {
        current,
        journal,
        label,
        readonly: !canEdit,
        tooltip,
    };
    const div = createTemplate(templates.editableIcons, templateData);

    if (canEdit) {
        div.querySelectorAll('li,a,.error-text').forEach((element) => {
            element.addEventListener('click', (event) => {
                event.preventDefault();
                /** @type {ActionSelectorOptions} */
                const options = {
                    items,
                    path: `flags.${MODULE_NAME}.${key}`,
                };
                new ActionSelector(item, options).render(true);
            });
        });
    }

    addNodeToRollBonus(parent, div, item, canEdit);
}

/** @ts-ignore */
/** @extends {DocumentSheet<ActionSelectorOptions, ItemPF>} */
class ActionSelector extends DocumentSheet {
    /** @override */
    static get defaultOptions() {
        const options = super.defaultOptions;

        options.height = 'auto';
        options.template = templates.actionsApp;
        options.title = localize('item-app.title');
        options.classes = ['item-based-list', 'action-selector'];
        options.filters = [
            {
                inputSelector: 'input[name=filter]',
                contentSelector: ".all-entities",
            },
        ];

        return options;
    }

    /**
     * Handle changes to search filtering controllers which are bound to the Application
     * @param {KeyboardEvent} _event   The key-up event from keyboard input
     * @param {string} query          The raw string input to the search field
     * @param {RegExp} rgx            The regular expression to test against
     * @param {HTMLElement} html      The HTML element which should be filtered
     * @override
     */
    _onSearchFilter(_event, query, rgx, html) {
        if (!query?.trim()) {
            /** @type {NodeListOf<HTMLElement>} */
            const currentHidden = html.querySelectorAll('.filtered-out');
            currentHidden.forEach((h) => h.classList.remove('filtered-out'));
            return;
        }

        /** @type {NodeListOf<HTMLElement>} */
        const typeGroups = html.querySelectorAll('.type-section');
        typeGroups.forEach((typeGroup) => {
            /** @type {NodeListOf<HTMLElement>} */
            const actions = typeGroup.querySelectorAll('.entity-selector-row[data-name]');

            actions.forEach((action) => {
                const name = action.dataset.name;
                const match = name && rgx.test(SearchFilter.cleanQuery(name));
                action.classList.toggle("filtered-out", !match);
                // if (match) {
                const forItem = html.querySelectorAll(`[data-item-id="${action.dataset.itemId}"]:not(.only-name)`);
                const forItemHidden = html.querySelectorAll(`[data-item-id="${action.dataset.itemId}"].filtered-out:not(.only-name)`);
                // if (forItem.length === forItemHidden.length) {
                const item = html.querySelector(`[data-item-id="${action.dataset.itemId}"].only-name`);
                item?.classList.toggle("filtered-out", forItem.length === forItemHidden.length);
                // }
                // }

            });

        });
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
        /** @type {{ item: ItemPF, path: string, groupedItems: {[key: string]: ActionSelectorOptions['items'][]} }} */
        const templateData = {
            item: this.object,
            path: this.options.path,
            groupedItems: {},
        };

        const items = this.options.items;

        items.forEach((item) => {
            item.actions.sort((a, b) => a.name.localeCompare(b.name))
        });

        items.sort((a, b) => {
            const first = a.typeLabel.localeCompare(b.typeLabel);
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

api.inputs.showActionInput = showActionInput;
api.applications.ActionSelector = ActionSelector;
