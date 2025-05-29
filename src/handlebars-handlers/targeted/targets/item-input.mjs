import { MODULE_NAME } from "../../../consts.mjs";
import { api } from '../../../util/api.mjs';
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../../../util/localize.mjs";
import { truthiness } from "../../../util/truthiness.mjs";
import { uniqueArray } from "../../../util/unique-array.mjs";
import { addNodeToRollBonus } from "../../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../../templates.mjs";

/**
 * @typedef {object} ItemSelectorOptions
 * @property {ItemTemplateData[]} items
 * @property {string} description
 * @property {string} path
 */

/**
 * @typedef {object} ItemTemplateData
 * @property {boolean} checked
 * @property {string} id
 * @property {string} img
 * @property {string} name
 * @property {string} typeLabel
 */

/**
 * @param {object} args
 * @param {(actor: ActorPF) => ItemPF[]} args.itemsFromActorFunc,
 * @param {ItemPF} args.item,
 * @param {string} args.journal,
 * @param {string} args.key,
 * @param {string} [args.description]
 * @param {string} [args.label]
 * @param {HTMLElement} args.parent
 * @param {string} [args.tooltip]
 * @param {object} options
 * @param {boolean} options.canEdit
 */
export function showItemInput({
    description = '',
    itemsFromActorFunc,
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

    description ||= 'item-app.description';
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);

    const currentIds = (/** @type {string[]} */ (item.getFlag(MODULE_NAME, key) || []))
        .map((x) => x.split('.').at(-1))
        .filter(truthiness);

    /** @type {ItemTemplateData[]} */
    const current = [];
    const items = itemsFromActorFunc(item.actor)
        .map(({ id, name, img, type, uuid }) => {
            const typeLabel = localize(CONFIG.Item.typeLabels[type]);
            const checked = currentIds.includes(id);
            const value = { checked, id, name, img, typeLabel, uuid };
            if (checked) {
                current.push(value);
            }
            return value;
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
                /** @type {ItemSelectorOptions} */
                const options = {
                    description: localize(description),
                    items,
                    path: `flags.${MODULE_NAME}.${key}`,
                };
                new ItemSelector(item, options).render(true);
            });
        });
    }
    div.querySelectorAll('li').forEach((element) => {
        element.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            // @ts-ignore
            const /** @type {HTMLElement?} */ target = event.target;

            let parent = target;
            while (parent && !parent.dataset.uuid) { parent = parent.parentElement }

            const uuid = parent?.dataset.uuid;
            if (uuid) {
                /** @type {ItemPF} */
                const doc = fromUuidSync(uuid);
                if (doc?.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER)) {
                    doc.sheet.render(true);
                }
            }
        });
    });

    addNodeToRollBonus(parent, div, item, canEdit, 'target');
}

/** @ts-ignore */
/** @extends {DocumentSheet<ItemSelectorOptions, ItemPF>} */
export class ItemSelector extends DocumentSheet {
    /** @override */
    static get defaultOptions() {
        const options = super.defaultOptions;

        options.classes = ['item-based-list', 'item-selector'];
        options.filters = [
            {
                inputSelector: 'input[name=filter]',
                contentSelector: ".all-entities",
            },
        ];
        options.height = 'auto';
        options.template = templates.itemsApp;
        options.title = localize('item-app.title');
        options.width = 300;

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
            const items = typeGroup.querySelectorAll('.entity-selector-row[data-name]');

            items.forEach((item) => {
                const name = item.dataset.name;
                const match = name && rgx.test(SearchFilter.cleanQuery(name));
                item.classList.toggle("filtered-out", !match);
            });
        });
    }

    /**
     * @param {MouseEvent} event
     */
    rightClick(event) {
        event.preventDefault();
        // @ts-ignore
        const  /** @type {HTMLElement?} */ target = event.target;
        let parent = target;
        while (parent && !parent.dataset.itemId) { parent = parent.parentElement }
        const id = parent?.dataset.itemId;
        if (id) {
            this.object.actor?.items.get(id)?.sheet.render(true, { focus: true });
        }
        return false;
    }

    /**
     * @override
     * @param {JQuery} jq
     */
    activateListeners(jq) {
        super.activateListeners(jq);
        jq.find('button[type=reset]')?.click(this.close.bind(this));

        // @ts-ignore
        const [html] = jq;
        /** @type {NodeListOf<HTMLElement>} */
        const items = html.querySelectorAll('.entity-selector-row')
        items.forEach((item) => {
            item.addEventListener('contextmenu', this.rightClick.bind(this));
        });
    }

    /** @override */
    async getData() {
        /** @type {{ description: string, item: ItemPF, path: string, groupedItems: {[key: string]: ItemSelectorOptions['items'][]} }} */
        const templateData = {
            description: this.options.description,
            item: this.object,
            path: this.options.path,
            groupedItems: {},
        };

        const items = this.options.items;

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

api.inputs.showItemInput = showItemInput;
api.applications.ItemSelector = ItemSelector;
