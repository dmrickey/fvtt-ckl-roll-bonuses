import { MODULE_NAME } from '../consts.mjs';
import { api } from '../util/api.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../util/localize.mjs';
import { Trait } from '../util/trait-builder.mjs';
import { addNodeToRollBonus } from './add-bonus-to-item-sheet.mjs';
import { createTemplate, templates } from './templates.mjs';

/**
 * @param {object} args
 * @param {Record<string, string> | string[]} [args.choices]
 * @param {FlagValue} [args.current]
 * @param {ItemPF} args.item
 * @param {string} args.journal
 * @param {string} args.key
 * @param {string} [args.description]
 * @param {boolean} [args.hasCustom]
 * @param {string} [args.label]
 * @param {number} [args.limit]
 * @param {string} [args.tooltip]
 * @param {HTMLElement} args.parent,
 * @param {object} options
 * @param {boolean} options.canEdit
 * @param {boolean} [options.isSubLabel]
 * @param {InputType} options.inputType
 */
export function traitInput({
    choices = {},
    description = '',
    hasCustom = true,
    item,
    journal,
    key,
    label = '',
    parent,
    tooltip = '',
    limit = 0,
}, {
    canEdit,
    inputType,
    isSubLabel = false,
}) {
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);

    if (Array.isArray(choices)) {
        choices = choices.reduce((acc, curr) => ({ ...acc, [curr]: curr }), {});
    }

    let current = item.getFlag(MODULE_NAME, key) || [];
    const traits = new Trait(choices, current);
    current = traits.names;

    const div = createTemplate(
        templates.traitInput,
        {
            current,
            isSubLabel,
            journal,
            key,
            label,
            readonly: !canEdit,
            tooltip,
        },
    );
    addNodeToRollBonus(parent, div, item, canEdit, inputType);

    div.querySelectorAll('.trait-selector').forEach((element) => {
        element.addEventListener('click', async (event) => {
            event.preventDefault();

            /** @type {Partial<ActorTraitSelectorOptions>} */
            const options = {
                description,
                document: item,
                name: `flags.${MODULE_NAME}.${key}`,
                title: label,
                subject: key,
                hasCustom,
                choices,
                limit,
            };

            /** @type {ActorTraitSelector} */
            const app = Object.values(item.apps).find(
                (app) => app instanceof ChecklistSelector && app.options.name === options.name
            );
            if (app) {
                app.render({ force: true });
                app.bringToFront();
            } else {
                var created = new ChecklistSelector(options);
                await created.render({ force: true });
            }
        });
    });
}

api.inputs.traitInput = traitInput;

/**
 * @param {ActorTraitSelector} app
 * @param {HTMLElement} element
 */
const onRender = (app, element) => {
    const { description, limit } = app.options;

    if (description) {
        const form = element.querySelector('section.form-body');
        if (form) {
            const div = document.createElement('div');
            div.innerHTML = description;
            div.setAttribute('style', 'margin-inline: 2rem; margin-block-end: 0.5rem; text-align: center;')
            form.prepend(div);
        }
    }

    if (limit) {
        const checked = element.querySelectorAll(`input[type="checkbox"]:checked`);
        if (checked.length >= limit) {
            const unchecked = element.querySelectorAll(`input[type="checkbox"]:not(:checked)`);
            unchecked.forEach((node) => node.setAttribute('disabled', ''));
        }
        else {
            const all = element.querySelectorAll(`input[type="checkbox"]`);
            all.forEach((node) => node.removeAttribute('disabled'));
        }
    }
};
Hooks.on('renderActorTraitSelector', onRender);

// @ts-ignore
class ChecklistSelector extends pf1.applications.ActorTraitSelector {
    /**
     * The event handler for changes to form input elements
     *
     * @override
     * @param {unknown} _formConfig   The configuration of the form being changed
     * @param {Event} _event                               The triggering event
     * @returns {void}
     */
    _onChangeForm(_formConfig, _event) {
        const formData = {};
        // @ts-ignore
        new FormData(this.element).forEach((value, key) => (formData[key] = value));

        const { custom, search } = foundry.utils.expandObject(formData);
        // @ts-ignore
        const choices = [];
        Object.entries(formData).forEach(([key, value]) => {
            if (key.startsWith('choices')) {
                choices.push(key.split(/\.(.*)/s)[1]);
            }
        })

        this._searchFilter = search;

        // @ts-ignore
        if (custom?.length) this.attributes.custom.add(...this.splitCustom(custom));

        // @ts-ignore
        this.attributes.standard = new Set(choices);
        this.render();
    }
}
