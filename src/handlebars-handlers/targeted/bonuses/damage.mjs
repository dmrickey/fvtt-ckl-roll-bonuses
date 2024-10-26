import { MODULE_NAME } from "../../../consts.mjs";
import { api } from '../../../util/api.mjs';
import { createTemplate, templates } from "../../templates.mjs";
import { addNodeToRollBonus } from "../../add-bonus-to-item-sheet.mjs";
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../../../util/localize.mjs";

/**
 * @param {object} args
 * @param {ItemPF} args.item
 * @param {string} args.journal
 * @param {string} args.key
 * @param {string} [args.changeKey]
 * @param {string} [args.tooltip]
 * @param {HTMLElement} args.parent
 * @param {object} options
 * @param {boolean} options.canEdit
 * @param {InputType} options.inputType
 */
export function damageInput({
    item,
    journal,
    key,
    changeKey,
    parent,
    tooltip,
}, {
    canEdit,
    inputType,
}) {
    const critChoices = {
        crit: localize('PF1.OnCritBonusFormula'),
        nonCrit: localize('PF1.NonMultBonusFormula'),
        normal: localize('PF1.DamageFormula'),
    };

    const hasChanges = !!changeKey;
    const damageTypes = pf1.registry.damageTypes.toObject();
    const label = localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);

    /** @type {DamageInputModel[]} */
    const parts = item.getFlag(MODULE_NAME, key) ?? [];
    const partsLabels = parts.map((part) => part.type.values.map((x) => damageTypes[x].name).join('; ') + (part.type.custom ? `; ${part.type.custom}` : ''));

    /** @type {{ formula: string, type: BonusTypes}[]} */
    let changes = [];
    if (changeKey) {
        changes = item.getFlag(MODULE_NAME, changeKey) || [];
    }

    const templateData = {
        bonusTypes: pf1.config.bonusTypes,
        changes,
        critChoices,
        damageTypes,
        hasChanges,
        item,
        journal,
        label,
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
        element.addEventListener('click', async (event) => {
            event.preventDefault();
            /** @type {HTMLElement } */
            // @ts-ignore
            const a = event.currentTarget;
            if (!a) return;

            /**
             * @param {string} key
             * @param {DamageInputModel[]} arg
             */
            async function update(key, arg) {
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
                await item.setFlag(MODULE_NAME, key, parts);
                return;
            }

            // Remove a damage component
            if (a.classList.contains("delete-damage")) {
                /** @type {HTMLDataListElement | null} */
                const li = a.closest(".damage-part");
                if (!li) return;
                const clonedParts = deepClone(parts);
                clonedParts.splice(Number(li.dataset.damagePart), 1);
                await item.setFlag(MODULE_NAME, key, clonedParts);
                return;
            }

            if (hasChanges) {
                // Add new damage component
                if (a.classList.contains("add-change")) {
                    // Get initial data
                    /** @type {BonusTypes} */
                    const type = 'untyped';
                    const initialData = {
                        formula: '',
                        type,
                    };

                    // Add data
                    changes.push(initialData);
                    await item.setFlag(MODULE_NAME, changeKey, changes);
                    return;
                }

                // Remove a damage component
                if (a.classList.contains("delete-change")) {
                    /** @type {HTMLDataListElement | null} */
                    const li = a.closest(".damage-part");
                    const index = li?.dataset.changeIndex;
                    if (!index) return;
                    const clonedChanges = deepClone(changes);
                    clonedChanges.splice(Number(index), 1);
                    await item.setFlag(MODULE_NAME, changeKey, clonedChanges);
                    return;
                }
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

    if (hasChanges) {
        div.querySelectorAll('.damage-change-formula').forEach((element) => {
            element.addEventListener('change', async (event) => {
                event.preventDefault();
                // @ts-ignore - event.target is HTMLTextAreaElement
                const /** @type {HTMLTextAreaElement} */ target = event.target;
                const updatedFormula = target?.value;

                // Check for normal damage part
                // @ts-ignore
                const index = target?.closest(".damage-part")?.dataset.changeIndex;
                if (index !== null) {
                    const path = `${index}.formula`;

                    setProperty(changes, path, updatedFormula);
                    await item.setFlag(MODULE_NAME, changeKey, changes);
                }
            });
        });

        div.querySelectorAll('.change-type').forEach((element) => {
            element.addEventListener('change', async (event) => {
                event.preventDefault();
                // @ts-ignore - event.target is HTMLTextAreaElement
                const /** @type {HTMLTextAreaElement} */ target = event.target;
                const critValue = target?.value;

                // Check for normal damage part
                // @ts-ignore
                const index = target?.closest(".damage-part")?.dataset.changeIndex;
                if (index !== null) {
                    const path = `${index}.type`;

                    setProperty(changes, path, critValue);
                    await item.setFlag(MODULE_NAME, changeKey, changes);
                }
            });
        });
    }

    addNodeToRollBonus(parent, div, item, canEdit, inputType);
}

api.inputs.damageInput = damageInput;
