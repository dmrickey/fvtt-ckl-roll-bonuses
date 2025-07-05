import { MODULE_NAME } from "../../../consts.mjs";
import { api } from '../../../util/api.mjs';
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../../../util/localize.mjs";
import { truthiness } from "../../../util/truthiness.mjs";
import { uniqueArray } from "../../../util/unique-array.mjs";
import { addNodeToRollBonus } from "../../add-bonus-to-item-sheet.mjs";
import { createTemplate, templates } from "../../templates.mjs";

// saves <item id>.<action id>[]

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
                    const uuid = `${loopItem.uuid}#${id}`
                    if (checked) {
                        current.push({ name: `${loopItem.name} - ${name}`, img, uuid });
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

                const options = {
                    actor: item.actor,
                    currentIds,
                    hint: localize('item-app.description-actions'),
                    window: { title: localize('item-app.title-action', { name: item.name }) },
                    /** @param {ItemAction[]} actions */
                    save: (actions) => {
                        item.update({
                            [`flags.${MODULE_NAME}.${key}`]: actions.map((action) => `${action.item.id}.${action.id}`),
                        });
                    }
                };
                new ActionSelect(options).render(true);
            });
        });
    }
    div.querySelectorAll('li').forEach((element) => {
        element.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            const target =  /** @type {HTMLElement?} */ (event.target);

            let parent = target;
            while (parent && !parent.dataset.uuid) { parent = parent.parentElement }

            const uuid = parent?.dataset.uuid;
            if (uuid) {
                const [itemId, actionId] = uuid.split('#');
                /** @type {ItemPF} */
                const doc = fromUuidSync(itemId);
                const actionDoc = doc?.actions.get(actionId);
                if (doc?.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER) && actionDoc) {
                    actionDoc.sheet.render(true);
                }
            }
        });
    });

    addNodeToRollBonus(parent, div, item, canEdit, 'target');
}

api.inputs.showActionInput = showActionInput;

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class ActionSelect extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor() {
        super(...arguments);

        this.#searchFilter = new SearchFilter({
            inputSelector: 'input[type=search]',
            contentSelector: '.all-entities',
            callback: (
                _event,
                query,
                rgx,
                html,
            ) => {
                if (!html) return;

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
                        const forItem = html.querySelectorAll(`[data-item-id="${action.dataset.itemId}"]:not(.only-name)`);
                        const forItemHidden = html.querySelectorAll(`[data-item-id="${action.dataset.itemId}"].filtered-out:not(.only-name)`);
                        const item = html.querySelector(`[data-item-id="${action.dataset.itemId}"].only-name`);
                        item?.classList.toggle("filtered-out", forItem.length === forItemHidden.length);
                    });
                });
            },
        });
    }

    static DEFAULT_OPTIONS = {
        classes: ['item-based-list', 'action-selector'],
        tag: "form",
        form: {
            handler: ActionSelect.#submitHandler,
            submitOnChange: false,
            closeOnSubmit: true,
        },
        position: {
            width: 300,
            height: 'auto',
        },
        window: {
            icon: 'fas fa-dice-d20',
        },
    };

    static PARTS = {
        form: {
            template: templates.actionsAppV2,
        },
        footer: {
            template: 'templates/generic/form-footer.hbs',
        },
    };

    /**
     *
     * @param {string} partId
     * @param {*} context
     * @param {*} options
     * @returns
     */
    _preparePartContext(partId, context, options) {
        switch (partId) {
            case 'form': {
                /** @type {{ hint: string,  groupedItems: {[key: string]: ActionSelectorOptions['items'][]} }} */
                const templateData = {
                    groupedItems: {},
                    hint: this.options.hint,
                };

                const currentIds = this.options.currentIds || [];

                this.#allItems = this.options.actor.items
                    .filter(x => x.hasAction);
                const items = this.#allItems.map((loopItem) => {

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
                            return value;
                        }),
                    };
                });

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
            case 'footer':
                return {
                    buttons: [
                        {
                            type: 'submit',
                            label: 'ckl-roll-bonuses.ok',
                            icon: 'fa-solid fa-save fa-fw',
                            default: true,
                        },
                        {
                            action: 'close',
                            type: 'reset',
                            icon: 'fas fa-rotate-left fa-fw',
                            label: 'ckl-roll-bonuses.cancel',
                        },
                    ],
                };
        }

        return context;
    }


    /**
     * Stored form data.
     * @type {object|null}
     */
    #config = null;

    #searchFilter;

    /** @type {ItemPF[]} */
    #allItems = [];

    /**
     * Getter for stored form data.
     * @type {object|null}
     */
    get config() {
        return this.#config;
    }

    /**
     * Factory method for asynchronous behavior.
     * @param {object} options            Application rendering options.
     * @returns {Promise<object|null>}    A promise that resolves to the form data, or `null`
     *                                    if the application was closed without submitting.
     */
    static async create(options) {
        const { promise, resolve } = Promise.withResolvers();
        const application = new this(options);
        application.addEventListener("close", () => resolve(application.config), { once: true });
        application.render({ force: true });
        return promise;
    }

    /**
     * Handle form submission. The basic usage of this function is to set `#config`
     * when the form is valid and submitted, thus returning `config: null` when
     * cancelled, or non-`null` when successfully submitted. The `#config` property
     * should not be used to store data across re-renders of this application.
     * @this {DSApplication}
     * @param {SubmitEvent} event           The submit event.
     * @param {HTMLFormElement} form        The form element.
     * @param {FormDataExtended} formData   The form data.
     */
    static #submitHandler(event, form, formData) {
        this.#config = this._processFormData(event, form, formData);
        this.options.save?.(this.#config);
    }

    /**
     * Perform processing of the submitted data. To prevent submission, throw an error.
     * @param {SubmitEvent} event           The submit event.
     * @param {HTMLFormElement} form        The form element.
     * @param {FormDataExtended} formData   The form data.
     * @returns {object}                    The data to return from this application.
     */
    _processFormData(event, form, formData) {
        const data = Object.values(formData.object).filter(truthiness);
        const actions = data.map((ids) => {
            const [iId, aId] = ids.split('.');
            const action = this.#allItems.find((x) => x.id === iId)?.actions.find(a => a.id === aId);
            return action;
        }).filter(truthiness);
        return actions;
    }

    /**
     * Actions performed after any render of the Application.
     * Post-render steps are not awaited by the render process.
     * @param {ApplicationRenderContext} context      Prepared context data
     * @param {RenderOptions} options                 Provided render options
     * @protected
     */
    _onRender(context, options) {
        this.#searchFilter.bind(this.element);

        /** @type {NodeListOf<HTMLElement>} */
        const items = this.element.querySelectorAll('.entity-selector-row, .action-selector-row.only-name')
        items.forEach((item) => {
            item.addEventListener('contextmenu', this.#rightClick.bind(this));
        });
    }

    /**
     * @param {MouseEvent} event
     */
    #rightClick(event) {
        event.preventDefault();
        const target = /** @type {HTMLElement?} */ (event.target);
        let parent = target;
        while (parent && !parent.dataset.itemId) { parent = parent.parentElement }
        const itemId = parent?.dataset.itemId;
        if (itemId) {
            const actionId = parent?.dataset.actionId
            const action = actionId && this.options.actor?.items.get(itemId)?.actions.get(actionId);
            if (action) {
                action.sheet.render(true, { focus: true });
            }
            else {
                this.options.actor?.items.get(itemId)?.sheet.render(true, { focus: true });
            }
        }
        return false;
    }
}

api.applications.ActionSelect = ActionSelect;