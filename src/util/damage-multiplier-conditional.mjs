import { getDeterministicPartsFormula, getFirstTermFormula } from './generic-formula-helpers.mjs';
import { localize } from './localize.mjs';
import { truthiness } from './truthiness.mjs';

/**
 * @template T
 * @param {T[]} array 
 * @param {number} times 
 * @returns {T[]}
 */
const repeatArray = (array, times) => Array(times).fill(array).flat();

/**
 * Adds damage parts that are the equivalent of multiplying out critical damage. E.g. Mythic Vital Strike or a lance charge.
 * 
 * @param {ActionUse} actionUse
 * @param {ItemConditional[]} conditionals
 * @param {string} label
 * @param {object} [options]
 * @param {boolean} [options.includeBaseAttackDamage]
 * @param {number} [options.multiplier]
 * @param {ItemConditionalModifierSourceData['subTarget']} [options.subTarget]
 * @returns {ItemConditional | undefined}
 */
export const buildDamageMultiplierConditional = (
    actionUse,
    conditionals,
    label,
    {
        includeBaseAttackDamage = true,
        // includeCritParts = false,
        multiplier = 2,
        subTarget = undefined,
    } = {},
) => {
    multiplier -= 1;
    if (multiplier <= 0) return;

    const formulaParts = [];
    /** @param {string[]} parts */
    const pushParts = (parts, excludeFirst = false) =>
        formulaParts.push(getDeterministicPartsFormula(parts.join(' + '), { ensureLeadingSign: true, excludeFirst }));

    const firstPartFormula = actionUse.action.damage?.parts[0]?.formula || '';

    // first part is usually the weapon damage. It's the only nondeterministic part we want to multiply, 
    // so we add it separately before the deterministic extraction to avoid accidentally excluding it. 
    if (includeBaseAttackDamage) {
        const firstDice = getFirstTermFormula(firstPartFormula);
        if (firstDice) {
            let firstDiceWithLabel = firstDice;
            if (!firstDice.includes('[')) {
                const l = `${actionUse.item.name} (${actionUse.action.name})`;
                firstDiceWithLabel = `${firstDice}[${l}]`;
            }
            formulaParts.push(firstDiceWithLabel);
        }
    }

    // excludes the first term by default so it doesn't duplicate the weapon damage above
    pushParts([firstPartFormula], true);
    actionUse.action.damage?.parts.slice(1).forEach(p => pushParts([p.formula]));

    // this.action.allDamageSources
    pushParts(actionUse.action.allDamageSources.map(x => `${x.formula}[${x.flavor}]`));

    // and ability source
    const abl = actionUse.shared.rollData.action?.ability.damage;
    const ability = abl && actionUse.shared.rollData.abilities?.[abl];
    if (ability) {
        const isNatural = actionUse.shared.rollData.item.subType === "natural";
        const held = actionUse.shared.rollData.action?.held || '1h';
        const ablMult =
            actionUse.shared.rollData.action?.ability.damageMult ?? (isNatural ? null : pf1.config.abilityDamageHeldMultipliers[held]) ?? 1;
        // Determine ability score bonus
        const max = actionUse.action.ability?.max ?? Infinity;
        const ablDamage = (ability.mod < 0)
            ? Math.min(max, ability.mod)
            : Math.floor(Math.min(max, ability.mod) * ablMult);

        if (ablDamage) {
            formulaParts.push(`${ablDamage}[${pf1.config.abilities[abl]}]`);
        }
    }

    // actionUse.shared.damageBonus
    pushParts(actionUse.shared.damageBonus);

    // filter all conditions // conditions.where target = damage and critial = normal
    pushParts(conditionals
        .filter(truthiness)
        .flatMap((c) => [...c.modifiers])
        .filter((m) => m.target === 'damage' && m.critical === 'normal')
        .map((m) => `${m.formula}`.includes('[') ? `${m.formula}` : `${m.formula}[${m.type}]`)
    );

    if (actionUse.shared.rollData.powerAttackBonus) {
        const label = ["rwak", "twak", "rsak"].includes(actionUse.shared.action.actionType)
            ? localize("PF1.DeadlyAim")
            : localize("PF1.PowerAttack");
        formulaParts.push(`${actionUse.shared.rollData.powerAttackBonus}[${label}]`);
    }

    const finalParts = formulaParts.filter(truthiness);
    if (!finalParts.length) {
        return;
    }

    const conditional = new pf1.components.ItemConditional({
        default: true,
        name: label,
        modifiers: [{
            _id: foundry.utils.randomID(),
            critical: 'nonCrit',
            formula: repeatArray(finalParts, multiplier).join(' + '),
            subTarget,
            target: 'damage',
            type: '',
            damageType: [...actionUse.action.damage?.parts[0]?.types],
        }],
    });

    return conditional;
}