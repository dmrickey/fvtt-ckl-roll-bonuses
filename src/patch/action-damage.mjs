// @ts-nocheck

import { getMartialFocusCondtional } from '../bonuses/martial-focus.mjs';
import { getGreaterWeaponSpecializaitonConditional } from '../bonuses/weapon-specialization/greater-weapon-specialization.mjs';
import { getWeaponSpecializaitonConditional } from '../bonuses/weapon-specialization/weapon-specialization.mjs';
import { MODULE_NAME } from '../consts.mjs';
import { handleBonusesFor } from '../target-and-bonus-join.mjs';
import { DiceModifierBonus } from '../targeted/bonuses/dice-modifier-bonus.mjs';
import { truthiness } from '../util/truthiness.mjs';

/**
 * Get action's damage formula.
 *
 * @internal
 * @param {ItemAction} action
 * @param {object} [options] - Additional options
 * @param {boolean} [options.simplify] - Simplify and compress the resulting formula before returning.
 * @param {boolean} [options.strict] - Strict option to pass to {@link pf1.utils.formula.simplify simplify}.
 * @returns {string}
 */
function actionDamage(action, { simplify = true, strict = true } = {}) {
    const actor = action.actor,
        item = action.item,
        actorData = actor?.system;

    /** BEGIN OVERRIDE */
    const actionData = deepClone(action.data);
    /** END OVERRIDE */

    const parts = [];

    const lazy = {
        _rollData: null,
        get rollData() {
            this._rollData ??= action.getRollData();
            return this._rollData;
        },
    };

    /** BEGIN OVERRIDE */
    if (!action[MODULE_NAME]?.conditionals) {
        // item[MODULE_NAME] ||= {};
        item[MODULE_NAME].conditionals ||= [];
        handleBonusesFor(
            action,
            (bonusType, sourceItem) => {
                const conditionals = [];
                conditionals.push(...(bonusType.getConditionals(sourceItem) ?? [])
                    .flatMap(x => x)
                    .filter(truthiness)
                    .flatMap(x => x.data.modifiers));
                item[MODULE_NAME].conditionals?.push(...conditionals);
            }
        );
        const extras = [
            getWeaponSpecializaitonConditional(item)?.data.modifiers[0],
            getGreaterWeaponSpecializaitonConditional(item)?.data.modifiers[0],
            getMartialFocusCondtional(item)?.data.modifiers[0],
        ].filter(truthiness);
        item[MODULE_NAME].conditionals.push(...extras);
    }

    const conditionals = item[MODULE_NAME]?.conditionals || [];
    /** END OVERRIDE */

    const handleFormula = (formula, change) => {
        try {
            switch (typeof formula) {
                case "string": {
                    // Ensure @item.level and similar gets parsed correctly
                    /** BEGIN OVERRIDE */
                    const _rd = formula.indexOf("@") >= 0 ? change?.parent?.getRollData() ?? lazy.rollData : {};
                    const rd = { ..._rd };
                    if (!isNaN(rd.size)) {
                        rd.size += conditionals
                            .filter((x) => x.target === 'size')
                            .map((x) => RollPF.safeTotal(x.formula))
                            .reduce((acc, x) => acc + x, 0);
                        /** END OVERRIDE */
                    }
                    if (formula != 0) {
                        const newformula = pf1.utils.formula.simplify(formula, rd, { strict });
                        if (newformula != 0) parts.push(newformula);
                    }
                    break;
                }
                case "number":
                    if (formula != 0) parts.push(`${formula}`);
                    break;
            }
        } catch (err) {
            console.error(`Action damage formula parsing error with "${formula}"`, err, action);
            parts.push("NaN");
        }
    };

    /** BEGIN OVERRIDE */
    /** @type {ItemConditionalModifierData['subTarget'][]} */
    const subTargets = ['allDamage', 'attack_0'];
    const allDamageParts = conditionals
        .filter((x) => x.target === 'damage' && subTargets.includes(x.subTarget) && x.critical === 'normal' && !!x.formula)
        .map(x => ({ formula: x.formula, type: x.damageType }));

    actionData.damage.parts.push(...allDamageParts);
    /** END OVERRIDE */

    const handleParts = (parts) => parts.forEach(({ formula }) => handleFormula(formula));

    // Normal damage parts
    handleParts(actionData.damage.parts);
    /** BEGIN OVERRIDE */
    if (parts[0]) {
        const fakeParts = [{ base: parts[0] }];
        DiceModifierBonus.preDamageRoll(action, lazy.rollData, fakeParts);
        parts[0] = fakeParts[0].base;
    }
    /** END OVERRIDE */

    const isNatural = action.item.subType === "natural";

    // Include ability score only if the string isn't too long yet
    const dmgAbl = actionData.ability.damage;
    if (dmgAbl) {
        const ablMax = actionData.ability?.max ?? Infinity;
        const dmgAblBaseMod = Math.min(actorData?.abilities[dmgAbl]?.mod ?? 0, ablMax);
        const held = action.data?.held || item?.system.held || "normal";
        let ablDmgMult =
            actionData.ability.damageMult ?? (isNatural ? null : pf1.config.abilityDamageHeldMultipliers[held]) ?? 1;
        if (isNatural && !(actionData.naturalAttack?.primaryAttack ?? true)) {
            ablDmgMult = actionData.naturalAttack?.secondary?.damageMult ?? 0.5;
        }

        const dmgAblMod = dmgAblBaseMod >= 0 ? Math.floor(dmgAblBaseMod * ablDmgMult) : dmgAblBaseMod;
        if (dmgAblMod != 0) parts.push(dmgAblMod);
    }

    /** BEGIN OVERRIDE */
    const nonCritDamageParts = conditionals
        .filter((x) => x.target === 'damage' && subTargets.includes(x.subTarget) && x.critical === 'nonCrit' && !!x.formula)
        .map(x => ({ formula: x.formula, type: { custom: '', values: [x.type] } }));

    actionData.damage.nonCritParts.push(...nonCritDamageParts);
    /** END OVERRIDE */

    // Include damage parts that don't happen on crits
    handleParts(actionData.damage.nonCritParts);

    // Include general sources. Item enhancement bonus is among these.
    action.allDamageSources.forEach((s) => handleFormula(s.formula, s));

    // Something probably went wrong
    // Early exit from invalid formulas
    if (parts.length === 0 || parts.some((p) => p === "NaN")) {
        console.warn("Action damage resulted in invalid formula:", parts.join(" + "), action);
        return "NaN";
    }

    const semiFinal = pf1.utils.formula.compress(parts.join("+"));
    if (!simplify) return semiFinal;

    // Simplification turns 1d12+1d8+6-8+3-2 into 1d12+1d8-1
    try {
        const rollData = semiFinal.indexOf("@") >= 0 ? lazy.rollData : undefined;
        const final = pf1.utils.formula.simplify(semiFinal, rollData, { strict });
        return pf1.utils.formula.compress(final);
    } catch (err) {
        console.error("Invalid action damage formula:", parts.join(" + "), action, err);
        return "NaN";
    }
}

Hooks.once('init', () => {
    pf1.utils.formula.actionDamage = actionDamage;
});
