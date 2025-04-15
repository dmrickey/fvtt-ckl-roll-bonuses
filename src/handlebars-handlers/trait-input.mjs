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
                (app) => app instanceof pf1.applications.ActorTraitSelector && app.options.name === options.name
            );
            if (app) {
                app.render({ force: true });
                app.bringToFront();
            } else {
                var created = new pf1.applications.ActorTraitSelector(options);
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
