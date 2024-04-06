import { MODULE_NAME } from "../../../consts.mjs";
import { createTemplate, templates } from "../../templates.mjs";
import { addNodeToRollBonus } from "../../add-bonus-to-item-sheet.mjs";
import { localize, localizeBonusTooltip } from "../../../util/localize.mjs";

/**
 * @param {object} args
 * @param {ItemPF} args.item
 * @param {string} args.journal
 * @param {string} args.key
 * @param {string} [args.tooltip]
 * @param {HTMLElement} args.parent
 * @param {object} options
 * @param {boolean} options.canEdit
 */
export function damageInput({
    item,
    journal,
    key,
    parent,
    tooltip,
}, {
    canEdit,
}) {
    const critChoices = {
        crit: localize('PF1.CritDamageBonusFormula'),
        nonCrit: localize('PF1.NonCritDamageBonusFormula'),
        normal: localize('PF1.DamageFormula'),
    };

    const isHealing = false;
    const damageTypes = pf1.registry.damageTypes.toObject();
    tooltip ||= localizeBonusTooltip(key);

    /** @type {DamageInputModel[]} */
    const parts = item.getFlag(MODULE_NAME, key) ?? [];
    const partsLabels = parts.map((part) => part.type.values.map((x) => damageTypes[x].name).join('; ') + (part.type.custom ? `; ${part.type.custom}` : ''));

    const templateData = {
        critChoices,
        damageTypes,
        isHealing,
        item,
        journal,
        label: isHealing ? localize('PF1.HealingFormula') : localize('PF1.DamageFormula'),
        parts,
        partsLabels,
        readonly: !canEdit,
        tooltip,
    };

    const div = createTemplate(
        templates.damageInput,
        templateData,
    );

    div.querySelectorAll('.damage-control').forEach((element) => {
        element.addEventListener('click', (event) => {
            event.preventDefault();
            /** @type {HTMLElement } */
            // @ts-ignore
            const a = event.currentTarget;
            if (!a) return;

            /**
             *
             * @param {DamageInputModel[]} arg
             */
            async function update(arg) {
                await item.setFlag(MODULE_NAME, key, arg);
            };

            // Add new damage component
            if (a.classList.contains("add-damage")) {
                // Get initial data
                /** @type {TraitSelectorValuePlural} */
                const damageTypeBase = pf1.components.ItemAction.defaultDamageType;
                /** @type {DamageInputModel} */
                const initialData = {
                    formula: "",
                    type: damageTypeBase,
                    crit: 'normal',
                };

                // Add data
                parts.push(initialData);
                return update(parts);
            }

            // Remove a damage component
            if (a.classList.contains("delete-damage")) {
                /** @type {HTMLDataListElement | null} */
                const li = a.closest(".damage-part");
                if (!li) return;
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
            // @ts-ignore
            const damageIndex = clickedElement?.closest(".damage-part")?.dataset.damagePart;
            if (damageIndex !== null) {
                const path = `${damageIndex}.type`;

                /**
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
            // @ts-ignore
            const damageIndex = target?.closest(".damage-part")?.dataset.damagePart;
            if (damageIndex !== null) {
                const path = `${damageIndex}.formula`;

                setProperty(parts, path, updatedFormula);
                await item.setFlag(MODULE_NAME, key, parts);
            }
        });
    });

    div.querySelectorAll('.damage-crit').forEach((element) => {
        element.addEventListener('change', async (event) => {
            event.preventDefault();
            // @ts-ignore - event.target is HTMLTextAreaElement
            const /** @type {HTMLTextAreaElement} */ target = event.target;
            const critValue = target?.value;

            // Check for normal damage part
            // @ts-ignore
            const damageIndex = target?.closest(".damage-part")?.dataset.damagePart;
            if (damageIndex !== null) {
                const path = `${damageIndex}.crit`;

                setProperty(parts, path, critValue);
                await item.setFlag(MODULE_NAME, key, parts);
            }
        });
    });

    addNodeToRollBonus(parent, div, item, canEdit);
}
