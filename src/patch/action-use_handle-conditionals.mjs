/**
 * @param {ActionUse} actionUse
 * @param {ItemConditional[]} conditionals
 */
export const handleConditionals = (actionUse, conditionals) => {
    if (!conditionals?.length) return;

    const rollDataConds = {};

    conditionals.forEach((conditional) => {
        if (!conditional.name) {
            console.warn("Ignored unnamed conditional", { conditional, actionUse: this });
            return;
        }

        const tag = pf1.utils.createTag(conditional.name);
        for (const [modKey, modifier] of conditional.modifiers.entries()) {
            // Ignore modifiers with nonexisting formula or formulas that equal to zero
            if (modifier.formula == 0) {
                console.warn("Ignored ineffective conditional modifier", { modifier, actionUse: this });
                return;
            }

            // Adds a formula's result to rollData to allow referencing it.
            // Due to being its own roll, this will only correctly work for static formulae.
            const conditionalRoll = RollPF.create(modifier.formula + '', actionUse.shared.rollData).evaluateSync({ forceSync: true });
            if (conditionalRoll.err) {
                ui.notifications.warn(
                    game.i18n.format("PF1.Warning.ConditionalRoll", { number: modKey + 1, name: conditional.name })
                );
                // Skip modifier to avoid multiple errors from one non-evaluating entry
                return;
            }

            rollDataConds[tag] ??= {};
            rollDataConds[tag][modKey] = conditionalRoll.total;

            // Create a key string for the formula array
            const partString = modifier.partID;

            // Add formula in simple format
            switch (modifier.target) {
                case "attack":
                case "effect":
                case "misc":
                case "dc":
                case "cl": {
                    const hasFlavor = /\[.*\]/.test(modifier.formula);
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

            const roll = RollPF.create(formula, actionUse.shared.rollData).evaluateSync({ forceSync: true });
            switch (target) {
                case "cl":
                    actionUse.shared.rollData.cl += roll.total;
                    break;
                case "dc":
                    actionUse.shared.rollData.dcBonus += roll.total;
                    break;
                case "charges":
                    actionUse.shared.rollData.chargeCostBonus += roll.total;
                    break;
            }
        }
    });
};
