import { MODULE_NAME } from '../consts.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../util/localize.mjs';
import { Trait } from '../util/trait-builder.mjs';
import { addNodeToRollBonus } from './add-bonus-to-item-sheet.mjs';
import { createTemplate, templates } from './templates.mjs';

/**
 * @param {object} args
 * @param {Record<string, string>} [args.choices]
 * @param {FlagValue} [args.current]
 * @param {ItemPF} args.item
 * @param {string} args.journal
 * @param {string} args.key
 * @param {boolean} [args.hasCustom]
 * @param {string} [args.label]
 * @param {string} [args.tooltip]
 * @param {HTMLElement} args.parent,
 * @param {object} options
 * @param {boolean} options.canEdit
 * @param {boolean} [options.isSubLabel]
 * @param {InputType} options.inputType
 */
export function traitInput({
    choices = {},
    hasCustom = true,
    item,
    journal,
    key,
    label = '',
    parent,
    tooltip = '',
}, {
    canEdit,
    inputType,
    isSubLabel = false,
}) {
    label ||= localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);

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
                document: item,
                name: `flags.${MODULE_NAME}.${key}`,
                title: label,
                subject: key,
                hasCustom,
                choices,
            };

            /** @type {ActorTraitSelector} */
            const app = Object.values(item.apps).find(
                (app) => app instanceof pf1.applications.ActorTraitSelector && app.options.name === options.name
            );
            if (app) {
                app.render({ force: true });
                app.bringToFront();
            } else {
                new pf1.applications.ActorTraitSelector(options).render({ force: true });
            }
        });
    });
}
