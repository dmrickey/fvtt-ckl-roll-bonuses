/**
 *
 * @param {ActionUseShared} shared
 * @param {*} conditional
 */
export function conditionalCalculator(shared, conditional) {
    const conditionalData = shared.rollData.conditionals || {};
    const tag = pf1.utils.createTag(conditional.name);
    for (const [i, modifier] of conditional.modifiers.entries()) {
        // Adds a formula's result to rollData to allow referencing it.
        // Due to being its own roll, this will only correctly work for static formulae.
        const rollTotal = RollPF.safeTotal(modifier.formula, shared.rollData);
        conditionalData[[tag, i].join(".")] = RollPF.safeTotal(modifier.formula, shared.rollData);

        // Create a key string for the formula array
        const partString = `${modifier.target}.${modifier.subTarget}${modifier.critical ? "." + modifier.critical : ""}`;
        // Add formula in simple format
        if (["attack", "effect", "misc"].includes(modifier.target)) {
            const hasFlavor = /\[.*\]/.test(modifier.formula);
            const flavoredFormula = hasFlavor ? modifier.formula : `(${modifier.formula})[${conditional.name}]`;
            shared.conditionalPartsCommon[partString] = [
                ...(shared.conditionalPartsCommon[partString] ?? []),
                flavoredFormula,
            ];
        }
        // Add formula as array for damage
        else if (modifier.target === "damage") {
            shared.conditionalPartsCommon[partString] = [
                ...(shared.conditionalPartsCommon[partString] ?? []),
                [modifier.formula, modifier.damageType, false],
            ];
        }
        // Add formula to the size property
        else if (modifier.target === "size") {
            shared.rollData.size += rollTotal;
        }
    }
    // Expand data into rollData to enable referencing in formulae
    shared.rollData.conditionals = expandObject(conditionalData, 5);

    // Add specific pre-rolled rollData entries
    for (const target of ["effect.cl", "effect.dc", "misc.charges"]) {
        if (shared.conditionalPartsCommon[target] != null) {
            const formula = shared.conditionalPartsCommon[target].join("+");
            const roll = RollPF.safeTotal(formula, shared.rollData);
            switch (target) {
                case "effect.cl":
                    // @ts-ignore
                    shared.rollData.cl += roll;
                    break;
                case "effect.dc":
                    shared.rollData.dcBonus ||= 0;
                    shared.rollData.dcBonus += roll;
                    break;
                case "misc.charges":
                    shared.rollData.chargeCostBonus ||= 0;
                    shared.rollData.chargeCostBonus += roll;
                    break;
            }
        }
    }
}

/**
 * "ItemChange" is used in damage tooltip source
 *
 * @param {ItemConditional} conditional
 * @param {ItemConditionalModifier} modifier
 * @param {object} [options]
 * @param {boolean} [options.isDamage]
 * @returns {Nullable<ItemChange>}
 */
export function conditionalModToItemChangeForDamageTooltip(conditional, modifier, { isDamage = false } = {}) {
    if (!modifier) return;

    const subTarget = modifier.target;
    if (subTarget !== 'attack' && subTarget !== 'damage') {
        return;
    }

    if (modifier.critical !== 'normal') {
        return;
    }

    if (modifier.subTarget !== 'allAttack' && modifier.subTarget !== 'allDamage') {
        return;
    }

    const change = new pf1.components.ItemChange({
        flavor: conditional.name,
        formula: modifier.formula,
        // @ts-ignore
        modifier: modifier.type ? pf1.config.bonusTypes[modifier.type] : modifier.type || undefined,
        operator: 'add',
        priority: 0,
        subTarget,
    });
    if (isDamage) {
        change.type = modifier.type;
    }

    change.value = modifier.formula;
    change.name = change.flavor;

    return change;
}

/**
 * @param {object} args
 * @param {string} args.name
 * @param {number | string} args.value
 * @param {BuffTarget} [args.subTarget]
 * @param {BonusTypes} [args.type]
 * @return {ItemChange}
 */
export function createChangeForTooltip({
    name,
    type = 'untypedPerm',
    value,
    subTarget = 'damage',
}) {
    const label = pf1.config.bonusTypes[type] || type;
    const change = new pf1.components.ItemChange({
        flavor: name,
        formula: value,
        modifier: label,
        operator: 'add',
        priority: 0,
        subTarget,
    });

    change.value = value;
    change.name = name;

    return change;
}

/**
 *
 * @param {ItemConditional} conditional
 * @param {ItemConditionalModifier} modifier
 * @returns {Nullable<ModifierSource>}
 */
export function conditionalAttackTooltipModSource(conditional, modifier) {
    if (!modifier) return;

    const subTarget = modifier.target;
    if (subTarget !== 'attack' && subTarget !== 'damage') {
        return;
    }

    if (modifier.critical !== 'normal') {
        return;
    }

    if (modifier.subTarget !== 'allAttack' && modifier.subTarget !== 'allDamage') {
        return;
    }

    const source = {
        name: conditional.name,
        value: RollPF.safeTotal(modifier.formula),
        modifier: modifier.type,
        sort: 0,
    };

    return source;
}
