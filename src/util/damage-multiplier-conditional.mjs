import { getFirstTermFormula } from './get-first-term-formula.mjs';
import { localize } from './localize.mjs';
import { truthiness } from './truthiness.mjs';

/**
 * Adds damage parts that are the equivalent of multiplying out critical damage. E.g. Mythic Vital Strike or a lance charge.
 * 
 * @param {ActionUse} actionUse
 * @param {ItemConditional[]} conditionals
 * @param {string} label
 * @param {object} options
 * @param {boolean} [options.includeActionDamage]
 * @param {number} options.multiplier
 * @param {ItemConditionalModifierSourceData['subTarget']} [options.subTarget]
 * @returns {ItemConditional| undefined}
 */
export const buildDamageMultiplierConditional = (
    actionUse,
    conditionals,
    label,
    {
        includeActionDamage = false,
        multiplier = 1,
        subTarget = undefined,
    },
) => {
    multiplier -= 1;
    if (multiplier <= 0) return;

    /**
     * @param {string | number} f
     * @param {string?} [l]
     * @returns {string}
    */
    const toFormula = (f, l) => `{${new Array(multiplier).fill(f).join(', ')}}${(l ? `[${l}]` : '')}`;

    const formulaParts = [];

    if (includeActionDamage) {
        const part = actionUse.action.damage?.parts[0];
        const partFormula = part?.formula || '';
        const firstDice = getFirstTermFormula(partFormula, actionUse.shared?.rollData ?? {});
        if (firstDice) {
            formulaParts.push(toFormula(firstDice));
        }
    }

    // this.action.allDamageSources
    formulaParts.push(...actionUse.action.allDamageSources.map(x => toFormula(x.formula, x.flavor)));

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
            formulaParts.push(toFormula(ablDamage, pf1.config.abilities[abl]));
        }
    }

    // actionUse.shared.damageBonus
    formulaParts.push(...actionUse.shared.damageBonus.map(x => toFormula(x)));

    // filter all conditions // conditions.where target = damage and critial = normal
    formulaParts.push(...conditionals
        .filter(truthiness)
        .flatMap((c) => [...c.modifiers])
        .filter((m) => m.target === 'damage' && m.critical === 'normal')
        .map((m) => toFormula(m.formula))
    );

    if (actionUse.shared.rollData.powerAttackBonus) {
        const label = ["rwak", "twak", "rsak"].includes(actionUse.shared.action.actionType)
            ? localize("PF1.DeadlyAim")
            : localize("PF1.PowerAttack");
        formulaParts.push(toFormula(actionUse.shared.rollData.powerAttackBonus, label));
    }

    if (!formulaParts.length) {
        return;
    }

    const conditional = new pf1.components.ItemConditional({
        default: true,
        name: label,
        modifiers: [{
            _id: foundry.utils.randomID(),
            critical: 'nonCrit',
            formula: `{${formulaParts.join(', ')}}[${label}]`,
            subTarget,
            target: 'damage',
            type: '',
            damageType: [...actionUse.action.damage?.parts[0]?.types],
        }],
    });

    return conditional;
}