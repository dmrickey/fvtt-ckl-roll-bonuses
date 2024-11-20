/**
 * @param {ActionUse} actionUse
 * @param {ItemConditionalData[]} conditionals
 */
export const handleConditionals = (actionUse, conditionals) => {
    if (conditionals.length) {
        const conditionalData = {};
        conditionals.forEach((conditional, i) => {
            const tag = pf1.utils.createTag(conditional.name);
            for (const [i, modifier] of conditional.modifiers.entries()) {
                // Adds a formula's result to rollData to allow referencing it.
                // Due to being its own roll, this will only correctly work for static formulae.
                const conditionalRoll = RollPF.safeRollAsync(modifier.formula, actionUse.shared.rollData);
                if (conditionalRoll.err) {
                    ui.notifications.warn(
                        game.i18n.format("PF1.Warning.ConditionalRoll", { number: i + 1, name: conditional.name })
                    );
                    // Skip modifier to avoid multiple errors from one non-evaluating entry
                    continue;
                } else
                    conditionalData[[tag, i].join(".")] = RollPF.safeRollAsync(modifier.formula, actionUse.shared.rollData).total;

                // Create a key string for the formula array
                const partString = `${modifier.target}.${modifier.subTarget}${modifier.critical ? "." + modifier.critical : ""
                    }`;
                // Add formula in simple format
                if (["attack", "effect", "misc"].includes(modifier.target)) {
                    const hasFlavor = /\[.*\]/.test(modifier.formula);
                    const flavoredFormula = hasFlavor ? modifier.formula : `(${modifier.formula})[${conditional.name}]`;
                    actionUse.shared.conditionalPartsCommon[partString] = [
                        ...(actionUse.shared.conditionalPartsCommon[partString] ?? []),
                        flavoredFormula,
                    ];
                }
                // Add formula as array for damage
                else if (modifier.target === "damage") {
                    actionUse.shared.conditionalPartsCommon[partString] = [
                        ...(actionUse.shared.conditionalPartsCommon[partString] ?? []),
                        [modifier.formula, modifier.damageType, false],
                    ];
                }
                // Add formula to the size property
                else if (modifier.target === "size") {
                    actionUse.shared.rollData.size += conditionalRoll.total;
                } else if (modifier.target === "critMult") {
                    actionUse.shared.rollData.critMultBonus += conditionalRoll.total;
                }
            }
        });

        // Expand data into rollData to enable referencing in formulae
        actionUse.shared.rollData.conditionals = foundry.utils.expandObject(conditionalData, 5);

        // Add specific pre-rolled rollData entries
        for (const target of ["effect.cl", "effect.dc", "misc.charges"]) {
            if (actionUse.shared.conditionalPartsCommon[target] != null) {
                const formula = actionUse.shared.conditionalPartsCommon[target].join("+");
                const roll = RollPF.safeRollAsync(formula, actionUse.shared.rollData, [target, formula]).total;
                switch (target) {
                    case "effect.cl":
                        actionUse.shared.rollData.cl += roll;
                        break;
                    case "effect.dc":
                        actionUse.shared.rollData.dcBonus += roll;
                        break;
                    case "misc.charges":
                        actionUse.shared.rollData.chargeCostBonus += roll;
                        break;
                }
            }
        }
    }
}
