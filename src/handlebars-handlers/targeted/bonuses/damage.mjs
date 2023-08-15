import { MODULE_NAME } from "../../../consts.mjs";
import { createTemplate, templates } from "../../templates.mjs";
import { addNodeToRollBonus } from "../../roll-bonus-on-actor-sheet.mjs";

/**
 * @param {object} args
 * @param {ItemPF} args.item
 * @param {string} args.key
 * @param {HTMLElement} args.parent
 * @param {ItemAction['data']['damage']['parts']} args.parts
 */
export function damageInput({
    item,
    key,
    parent,
    parts,
}) {
    const templateData = {
        damageTypes: pf1.registry.damageTypes.toObject(),
        isHealing: false,
        parts,
    };

    const damageInput = createTemplate(
        templates.damageInput,
        templateData,
    );
    const div = document.createElement('div');
    div.innerHTML = damageInput;

    div.querySelectorAll('.damage-control').forEach((element) => {
        element.addEventListener('click', (event) => {
            event.preventDefault();
            /** @type {HTMLElement} */
            const a = event.currentTarget;
            if (!a) return;

            /**
             *
             * @param {{ [key: string]: object }} arg
             */
            async function update(arg) {
                await item.setFlag(MODULE_NAME, key, arg);
            };

            // Add new damage component
            if (a.classList.contains("add-damage")) {
                // Get initial data
                /** @type {TraitSelectorValuePlural} */
                const damageTypeBase = pf1.components.ItemAction.defaultDamageType;
                const initialData = {
                    formula: "",
                    type: damageTypeBase,
                };

                // Add data
                return update(parts.concat([initialData]));
            }

            // Remove a damage component
            if (a.classList.contains("delete-damage")) {
                const li = a.closest(".damage-part");
                const clonedParts = deepClone(parts);
                clonedParts.splice(Number(li.dataset.damagePart), 1);
                return update(clonedParts);
            }
        });
    });

    div.querySelectorAll('.damage-type-visual').forEach((element) => {
        element.addEventListener('click', (event) => {
            event.preventDefault();
            const clickedElement = event.currentTarget;

            // Check for normal damage part
            const damageIndex = clickedElement?.closest(".damage-part")?.dataset.damagePart;
            if (damageIndex !== null) {
                const path = `${damageIndex}.type`;

                /**
                 *
                 * @param {{ [key: string]: object }} arg
                 */
                async function update(arg) {
                    setProperty(parts, path, arg[path]);
                    await item.setFlag(MODULE_NAME, key, parts);
                };

                const app = new pf1.applications.DamageTypeSelector(
                    { id: key, update },
                    path,
                    parts[damageIndex].type,
                );
                return app.render(true);
            }
        });
    });

    div.querySelectorAll('.damage-formula').forEach((element) => {
        element.addEventListener('change', async (event) => {
            event.preventDefault();
            // @ts-ignore - event.target is HTMLTextAreaElement
            const /** @type {HTMLTextAreaElement} */ target = event.target;
            const updatedFormula = target?.value;

            // Check for normal damage part
            const damageIndex = target?.closest(".damage-part")?.dataset.damagePart;
            if (damageIndex !== null) {
                const path = `${damageIndex}.formula`;

                setProperty(parts, path, updatedFormula);
                await item.setFlag(MODULE_NAME, key, parts);
            }
        });
    });

    addNodeToRollBonus(parent, div);
}
