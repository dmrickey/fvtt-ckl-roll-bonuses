import { localize } from './localize.mjs';
import { truthiness } from './truthiness.mjs';

/**
 * @param {ActionUse} actionUse
 * @param {ItemConditional[]} conditionals
 * @param {string} label
 * @param {number} [multiplier]
 * @returns {ItemConditional| undefined}
 */
export const buildDamageMultiplierConditional = (actionUse, conditionals, label, multiplier = 1) => {

    const formulaParts = [];

    /**
     * @param {string | number} f
     * @param {string?} [l]
     * @returns {string}
    */
    const toFormula = (f, l) => `{${new Array(multiplier).fill(f).join(', ')}}${(l ? `[${l}]` : '')}`;

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
            subTarget: 'attack_0',
            target: 'damage',
            type: '',
            damageType: [...actionUse.action.damage?.parts[0]?.types],
        }],
    });

    return conditional;
}