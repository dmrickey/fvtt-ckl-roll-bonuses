/**
 * @param {ActionUse} actionUse
 * @param {ItemConditional[]} conditionals
 */
export const handleConditionals = async (actionUse, conditionals) => {
    if (!conditionals?.length) return;

    /** @type {RollData['conditionals']} */
    const rollDataConds = {};

    for (const conditional of conditionals) {
        const tag = pf1.utils.createTag(conditional.name);
        for (const [modKey, modifier] of conditional.modifiers.entries()) {
            // Ignore modifiers with nonexisting formula or formulas that equal to zero
            if (modifier.formula == 0) {
                console.warn("Ignored ineffective conditional modifier", { modifier, actionUse });
                continue;
            }

            // Adds a formula's result to rollData to allow referencing it.
            // Due to being its own roll, this will only correctly work for static formulae.
            const conditionalRoll = await RollPF.safeRoll(modifier.formula + '', actionUse.shared.rollData, undefined, undefined, {
                allowInteractive: false,
            });
            if (conditionalRoll.err) {
                ui.notifications.warn(
                    game.i18n.format("PF1.Warning.ConditionalRoll", { number: modKey + 1, name: conditional.name })
                );
                // Skip modifier to avoid multiple errors from one non-evaluating entry
                continue;
            }

            rollDataConds[tag] ??= {};
            rollDataConds[tag][modKey] = conditionalRoll.total;

            // Create a key string for the formula array
            const partString = modifier.partID;

            // Add formula in simple format
            switch (modifier.target) {
                case "attack":
                case "charges":
                case "dc":
                case "cl": {
                    const hasFlavor = /\[.*\]/.test(modifier.formula + '');
                    const flavoredFormula = hasFlavor ? modifier.formula : `(${modifier.formula})[${conditional.name}]`;
                    actionUse.shared.conditionalPartsCommon[partString] = [
                        ...(actionUse.shared.conditionalPartsCommon[partString] ?? []),
                        flavoredFormula,
                    ];
                    break;
                }
                // Add formula as array for damage
                case "damage":
                    actionUse.shared.conditionalPartsCommon[partString] = [
                        ...(actionUse.shared.conditionalPartsCommon[partString] ?? []),
                        [modifier.formula, modifier.damageType, false],
                    ];
                    break;
                // Add formula to the size property
                case "size":
                    actionUse.shared.rollData.size += conditionalRoll.total;
                    if (actionUse.shared.rollData.item) {
                        actionUse.shared.rollData.item.size += conditionalRoll.total;
                    }
                    break;
                case "critMult":
                    actionUse.shared.rollData.critMultBonus += conditionalRoll.total;
                    break;
                default:
                    console.warn("Invalid conditional target:", modifier.target);
                    break;
            }
        }

        // Expand data into rollData to enable referencing in formulae
        actionUse.shared.rollData.conditionals = rollDataConds;

        // Add specific pre-rolled rollData entries
        for (const target of ["cl", "dc", "charges"]) {
            const cond = actionUse.shared.conditionalPartsCommon[target];
            if (!cond) continue;
            const formula = cond.join(" + ");

            const roll = await RollPF.safeRoll(formula, actionUse.shared.rollData, { target, formula });
            switch (target) {
                case "cl":
                    actionUse.shared.rollData.cl ||= 0;
                    actionUse.shared.rollData.cl += roll.total;
                    break;
                case "dc":
                    actionUse.shared.rollData.dcBonus ||= 0;
                    actionUse.shared.rollData.dcBonus += roll.total;
                    break;
                case "charges":
                    actionUse.shared.rollData.chargeCostBonus ||= 0;
                    actionUse.shared.rollData.chargeCostBonus += roll.total;
                    break;
            }
        }
    }
};
