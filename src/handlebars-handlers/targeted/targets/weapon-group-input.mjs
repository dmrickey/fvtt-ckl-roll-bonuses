import { MODULE_NAME } from "../../../consts.mjs";
import { localize } from "../../../util/localize.mjs";
import { uniqueArray } from "../../../util/unique-array.mjs";
import { templates } from "../../init.mjs";
import { addNodeToRollBonus } from "../../roll-bonus-on-actor-sheet.mjs";

/**
 * @param {object} args
 * @param {ItemPF} args.item
 * @param {string} args.key
 * @param {HTMLElement} args.parent
 * @param {string[]} [args.custom]
 */
export function weaponTypeInput({
    item,
    key,
    parent,
    custom = [],
}) {
    custom = uniqueArray(custom);
    /** @type {TraitSelector} */
    const currentValue = item.getFlag(MODULE_NAME, key);
    const current = currentValue?.value.reduce((acc, curr) => ({ ...acc, [curr]: pf1.config.weaponGroups[curr] || curr }), {});
    const templateData = {
        current,
    };
    const damageInput = Handlebars.partials[templates.targetWeaponGroup](templateData, { allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true });
    const div = document.createElement('div');
    div.innerHTML = damageInput;

    div.querySelectorAll('.trait-selector').forEach((element) => {
        element.addEventListener('click', (event) => {
            event.preventDefault();

            const options = {
                name: `flags.${MODULE_NAME}.${key}`,
                title: localize(`Weapon Groups - ${item.name}`),
                // subject: a.dataset.options, // no idea
                choices: {
                    ...pf1.config.weaponGroups,
                    ...custom.reduce((acc, curr) => ({ ...acc, [curr]: curr, }), {})
                },
                hideCustom: true,
            };

            Hooks.once('renderActorTraitSelector', (
                /** @type {ActorTraitSelector} */ app,
                /** @type {JQuery} */ jq,
                /** @type {Object} */ options,
            ) => {
                jq.find('.form-group.stacked').hide();
                app.setPosition();
            });
            new pf1.applications.ActorTraitSelector(item, options).render(true);
        });
    });

    addNodeToRollBonus(parent, div);
}
