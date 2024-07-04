// @ts-nocheck

import { handleBonusesFor } from '../target-and-bonus-join.mjs';

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
        actorData = actor?.system,
        actionData = action.data;

    const parts = [];

    const lazy = {
        _rollData: null,
        get rollData() {
            this._rollData ??= action.getRollData();
            return this._rollData;
        },
    };

    const handleFormula = (formula, change) => {
        try {
            switch (typeof formula) {
                case "string": {
                    // Ensure @item.level and similar gets parsed correctly
                    /** BEGIN OVERRIDE */
                    const _rd = formula.indexOf("@") >= 0 ? change?.parent?.getRollData() ?? lazy.rollData : {};
                    const rd = { ..._rd };
                    if (!isNaN(rd.size)) {
                        handleBonusesFor(
                            action,
                            (bonusType, sourceItem) => rd.size += bonusType.getConditional?.(sourceItem)?.modifiers
                                .filter((x) => x.target === 'size')
                                .map((x) => RollPF.safeTotal(x.formula))
                                .reduce((acc, x) => acc + x, 0) ?? 0
                        );
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

    const handleParts = (parts) => parts.forEach(({ formula }) => handleFormula(formula));

    // Normal damage parts
    handleParts(actionData.damage.parts);

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
