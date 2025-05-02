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
    // order of these determines the order in the UI, so don't alphabetize them
    const critChoices = {
        normal: localize('damage-formula'),
        crit: localize('PF1.OnCritBonusFormula'),
        nonCrit: localize('PF1.NonMultBonusFormula'),
    };

    const hasChanges = !!changeKey;
    // const damageTypes = pf1.registry.damageTypes.toObject();
    const label = localizeBonusLabel(key);
    tooltip ||= localizeBonusTooltip(key);

    /** @type {DamageInputModel[]} */
    const savedParts = item.getFlag(MODULE_NAME, key) ?? [];
    const typedParts = savedParts.map((p) => {
        /** @type { DamagePartModel & { crit?: Nullable<string>, label?: string } } */
        const part = new pf1.models.action.DamagePartModel({ ...p });
        part.crit = p.crit;
        part.label = part.names.join('; ');
        return part;
    });

    /** @type {{ formula: string, type: BonusTypes}[]} */
    let changes = [];
    if (changeKey) {
        changes = item.getFlag(MODULE_NAME, changeKey) || [];
    }

    const templateData = {
        bonusTypes: pf1.config.bonusTypes,
        changes,
        critChoices,
        hasChanges,
        item,
        journal,
        label,
        readonly: !canEdit,
        tooltip,
        typedParts,
    };

    const div = createTemplate(
        templates.damageInput,
        templateData,
    );

    div.querySelectorAll('.damage-control').forEach((element) => {
        element.addEventListener('click', async (event) => {
            event.preventDefault();

            const a = /** @type {HTMLElement} */ (event.currentTarget);
            if (!a) return;

            // Add new effect damage
            if (a.classList.contains("add-damage")) {
                var defaultDamage = new pf1.models.action.DamagePartModel().toObject(true, false);
                /** @type {DamageInputModel} */
                const initialData = {
                    formula: defaultDamage.formula || '',
                    types: defaultDamage.types,
                    crit: 'normal',
                };

                // Add data
                savedParts.push(initialData);
                await item.setFlag(MODULE_NAME, key, savedParts);
                return;
            }

            // Remove a specific effect damage
            if (a.classList.contains("delete-damage")) {
                /** @type {HTMLDataListElement | null} */
                const li = a.closest(".damage-part");
                if (!li) return;
                const clonedParts = foundry.utils.deepClone(savedParts);
                clonedParts.splice(Number(li.dataset.damagePart), 1);
                await item.setFlag(MODULE_NAME, key, clonedParts);
                return;
            }

            if (hasChanges) {
                // Add change damage
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

                // Remove specific change damage
                if (a.classList.contains("delete-change")) {
                    /** @type {HTMLDataListElement | null} */
                    const li = a.closest(".damage-part");
                    const index = li?.dataset.changeIndex;
                    if (!index) return;
                    const clonedChanges = foundry.utils.deepClone(changes);
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
            const clickedElement = /** @type {HTMLElement} */ (event.currentTarget);
            /** @type {HTMLDataListElement | null} */
            const data = clickedElement?.closest(".damage-part")

            const damageIndex = data?.dataset.damagePart;
            if (damageIndex !== null && damageIndex !== undefined) {
                const path = `${damageIndex}.types`;

                /** @param {{ [key: string]: object }} arg */
                async function updateCallback(arg) {
                    foundry.utils.setProperty(savedParts, path, arg);
                    await item.setFlag(MODULE_NAME, key, savedParts);
                };

                const app = new pf1.applications.DamageTypeSelector(
                    { uuid: key },
                    path,
                    savedParts[+damageIndex].types,
                    { updateCallback },
                );
                return app.render(true);
            }
        });
    });

    div.querySelectorAll('.damage-formula').forEach((element) => {
        element.addEventListener('change', async (event) => {
            event.preventDefault();
            const target = /** @type {HTMLTextAreaElement} */ (event.target);
            const updatedFormula = target?.value;

            // Check for normal damage part
            // @ts-ignore
            const damageIndex = target?.closest(".damage-part")?.dataset.damagePart;
            if (damageIndex !== null && damageIndex !== undefined) {
                const path = `${damageIndex}.formula`;

                foundry.utils.setProperty(savedParts, path, updatedFormula);
                await item.setFlag(MODULE_NAME, key, savedParts);
            }
        });
    });

    div.querySelectorAll('.damage-crit').forEach((element) => {
        element.addEventListener('change', async (event) => {
            event.preventDefault();
            const target = /** @type {HTMLTextAreaElement} */ (event.target);
            const critValue = target?.value;

            // Check for normal damage part
            // @ts-ignore
            const damageIndex = target?.closest(".damage-part")?.dataset.damagePart;
            if (damageIndex !== null) {
                const path = `${damageIndex}.crit`;

                foundry.utils.setProperty(savedParts, path, critValue);
                await item.setFlag(MODULE_NAME, key, savedParts);
            }
        });
    });

    if (hasChanges) {
        div.querySelectorAll('.damage-change-formula').forEach((element) => {
            element.addEventListener('change', async (event) => {
                event.preventDefault();
                const target = /** @type {HTMLTextAreaElement} */ (event.target);
                const updatedFormula = target?.value;

                // Check for normal damage part
                // @ts-ignore
                const index = target?.closest(".damage-part")?.dataset.changeIndex;
                if (index !== null && index !== undefined) {
                    const path = `${index}.formula`;

                    foundry.utils.setProperty(changes, path, updatedFormula);
                    await item.setFlag(MODULE_NAME, changeKey, changes);
                }
            });
        });

        div.querySelectorAll('.change-type').forEach((element) => {
            element.addEventListener('change', async (event) => {
                event.preventDefault();
                const target = /** @type {HTMLTextAreaElement} */ (event.target);
                const critValue = target?.value;

                // Check for normal damage part
                // @ts-ignore
                const index = target?.closest(".damage-part")?.dataset.changeIndex;
                if (index !== null && index !== undefined) {
                    const path = `${index}.type`;

                    foundry.utils.setProperty(changes, path, critValue);
                    await item.setFlag(MODULE_NAME, changeKey, changes);
                }
            });
        });
    }

    addNodeToRollBonus(parent, div, item, canEdit, inputType);
}

api.inputs.damageInput = damageInput;
