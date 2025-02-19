import { MODULE_NAME } from '../consts.mjs';

/**
 * "ItemChange" is used in damage tooltip source
 *
 * @param {{ name: string }} conditional
 * @param {ItemConditionalModifierData} modifier
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
 * @param {string} [args.name]
 * @param {number | string} args.value
 * @param {BuffTarget} [args.target]
 * @param {BonusTypes} [args.type]
 * @param {ItemChangeOptions} [options]
 * @return {ItemChange}
 */
export function createChange({
    name = undefined,
    type = 'untypedPerm',
    value,
    target = 'damage',
}, {
    parent,
} = { parent: undefined }) {
    const change = new pf1.components.ItemChange({
        flavor: name,
        formula: value,
        type,
        operator: 'add',
        priority: 0,
        target,
    }, {
        parent
    });

    change.value = value;
    change.name = name;

    return change;
}

/**
 * @param {object} args
 * @param {string} args.name
 * @param {number | string} args.value
 * @param {BuffTarget} [args.target]
 * @param {BonusTypes} [args.type]
 * @return {ItemChange}
 */
export function createChangeForTooltip({
    name,
    type = 'untypedPerm',
    value,
    target = 'damage',
}) {
    const label = pf1.config.bonusTypes[type] || type;
    const change = new pf1.components.ItemChange({
        flavor: name,
        formula: value,
        type: label,
        operator: 'add',
        priority: 0,
        target,
    });

    change.value = value;
    change.name = name;

    return change;
}

/**
 *
 * @param {{ name: string }} conditional
 * @param {ItemConditionalModifierData} modifier
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

/**
 * @param {Nullable<TraitSelectorValuePlural>} types
 * @returns {string}
 */
export function damagesTypeToString(types) {
    if (!types) return '';

    if (!types.custom?.trim() && !types.values?.length) {
        const untyped = pf1.registry.damageTypes.get('untyped')?.name;
        if (!untyped) {
            throw new Error("There's no `untyped` damage type in the pf1 config.");
        }
        return untyped;
    }

    const valueLookup = ( /** @type {DamageType['id']} */ t) => pf1.registry.damageTypes.getLabels()[t] || t;
    /**
     * @param {TraitSelectorValuePlural} t
     */
    // @ts-ignore
    const typeToString = (t) => `${t.custom?.trim() ? `${t.custom.trim()}, ` : ''}${t.values.map(valueLookup).join(', ')}`;
    return typeToString(types);
}

/**
 * @param {ItemPF} item
 * @param {string} key
 * @param {object} [options]
 * @param {boolean} [options.useCachedFormula]
 * @return {ItemConditional[]}
 */
export const loadConditionals = (item, key, { useCachedFormula = false } = {}) => {
    /** @type {ItemConditionalData[]} */
    const flags = deepClone(item.getFlag(MODULE_NAME, key) || []);

    flags.forEach((c) => {
        if (!c.name) c.name = item.name;
        c.modifiers.forEach((m) => {
            if (useCachedFormula) {
                const formula = item[MODULE_NAME][key]?.conditionals?.[c._id]?.[m._id];
                if (formula) {
                    m.formula = formula;
                }
            }
            if (m.target === 'damage') {
                m.type = damagesTypeToString(m.damageType)
            }
        });
    });



    const conditionals = flags.map((d) => new pf1.components.ItemConditional(d));
    return conditionals;
}
