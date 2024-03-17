// @ts-nocheck
// copied from pf1 - fixed to include bonus for size modifier

import { handleBonusesFor } from '../target-and-bonus-join.mjs';

/**
 *
 * @param {ItemAction} action
 * @param {object} rollData
 * @param {object} [options]
 */
function actionDamage(action, rollData, options) {
    if (!action.hasDamage) return null;

    const actor = action.actor,
        item = action.item,
        actorData = actor?.system,
        actionData = action.data,
        combine = options.hash.combine ?? true;

    const parts = [];

    const handleFormula = (formula, change) => {
        try {
            switch (typeof formula) {
                case "string": {
                    // Ensure @item.level and similar gets parsed correctly
                    const _rd = formula.indexOf("@") >= 0 ? change?.parent?.getRollData() ?? rollData : {};
                    const rd = { ..._rd };
                    if (!isNaN(rd.size)) {
                        handleBonusesFor(
                            action,
                            (bonusTarget, bonus) => rd.size += bonus.getConditional(bonusTarget)?.modifiers
                                .filter((x) => x.target === 'size')
                                .map((x) => RollPF.safeTotal(x.formula))
                                .reduce((acc, x) => acc + x, 0) ?? 0
                        );
                    }
                    const newformula = simplifyFormula(formula, rd, { combine });
                    if (newformula != 0) parts.push(newformula);
                    break;
                }
                case "number":
                    if (formula != 0) parts.push(`${formula}`);
                    break;
            }
        } catch (err) {
            console.error(`Formula parsing error with "${formula}"`);
            parts.push("NaN");
        }
    };

    const handleParts = (parts) => parts.forEach(({ formula }) => handleFormula(formula));

    // Normal damage parts
    handleParts(actionData.damage.parts);

    // Include ability score only if the string isn't too long yet
    const dmgAbl = actionData.ability.damage;
    const dmgAblMod = Math.floor((actorData?.abilities[dmgAbl]?.mod ?? 0) * (actionData.ability.damageMult || 1));
    if (dmgAblMod != 0) parts.push(dmgAblMod);

    // Include damage parts that don't happen on crits
    handleParts(actionData.damage.nonCritParts);

    // Include general sources. Item enhancement bonus is among these.
    action.allDamageSources.forEach((s) => {
        if (s.operator === "script") return;
        handleFormula(s.formula, s);
    });

    if (parts.length === 0) parts.push("NaN"); // Something probably went wrong

    const simplifyMath = (formula) =>
        formula
            .replace(/\s+/g, "") // remove whitespaces
            .replace(/\+-/g, "-") // + -n = -n
            .replace(/--/g, "+") // - -n = +n
            .replace(/-\+/g, "-") // - +n = -n
            .replace(/\+\++/g, "+"); // + +n = +n

    const semiFinal = simplifyMath(parts.join("+"));
    if (semiFinal === "NaN") return semiFinal;
    if (!combine) return semiFinal;
    // With combine enabled, the following turns 1d12+1d8+6-8+3-2 into 1d12+1d8-1
    const final = simplifyFormula(semiFinal, null, { combine });
    return simplifyMath(final);
}

Hooks.on('init', () => Handlebars.registerHelper("actionDamage", actionDamage));

const stripRollFlairs = (formula) => formula.replace(/\[[^\]]*]/g, "");

function simplifyFormula(formula, rollData = {}, { combine = true } = {}) {
    const originalTerms = RollPF.parse(stripRollFlairs(formula), rollData);

    const semiEvalTerms = [];
    // Resolve sizeRoll() and some other deterministic pieces
    while (originalTerms.length) {
        const term = originalTerms.shift();

        if (term instanceof DiceTerm) {
            semiEvalTerms.push(term);
        } else if (term instanceof OperatorTerm) {
            // Combine terms resulting in a boolean
            if ([">=", ">", "<=", "<", "==", "===", "!=", "!==", "||", "&&", "??"].includes(term.operator)) {
                const left = semiEvalTerms.pop();
                const right = originalTerms.shift();
                const terms = [left, term, right];
                const roll = RollPF.fromTerms(terms);
                roll.evaluate({ async: false });
                semiEvalTerms.push(new NumericTerm({ number: roll.total }));
            } else {
                semiEvalTerms.push(term);
            }
        } else if (term instanceof CONFIG.Dice.termTypes.SizeRollTerm) {
            term.evaluate({ async: false });
            semiEvalTerms.push(term);
        } else if (term.isDeterministic) {
            const evl = RollPF.safeTotal(term.formula);
            semiEvalTerms.push(...RollPF.parse(`${evl}`));
        } else {
            semiEvalTerms.push(term);
        }
    }

    // Combine simple terms (e.g. 5+3) and resolve ternaries
    const combinedTerms = [];
    let prev, term;
    while (semiEvalTerms.length) {
        prev = term;
        term = semiEvalTerms.shift();
        const next = semiEvalTerms[0];
        if (term instanceof OperatorTerm) {
            // Ternary handling
            if (term.operator === "?") {
                semiEvalTerms.shift(); // remove if-true val
                const elseOp = semiEvalTerms.shift();
                const falseVal = semiEvalTerms.shift();

                const condition = RollPF.safeTotal(prev.formula);
                let resulting = condition ? next.formula : falseVal?.formula ?? "";
                combinedTerms.pop(); // Remove last term
                if (resulting) {
                    // Unparenthetical
                    if (/^\((.*)\)$/.test(resulting)) {
                        resulting = resulting.slice(1, -1);
                    }
                    const subterms = RollPF.parse(resulting);
                    combinedTerms.push(...subterms);
                }
                continue;
            } else if (prev instanceof NumericTerm && next instanceof NumericTerm) {
                if (combine) {
                    const simpler = RollPF.safeEval([prev.formula, term.formula, next.formula].join(""));
                    term = RollPF.parse(`${simpler}`)[0];
                    combinedTerms.pop(); // Remove the last numeric term
                    semiEvalTerms.shift(); // Remove the next term
                }
            }
        }
        combinedTerms.push(term);
    }

    return combinedTerms.map((tt) => tt.formula).join("");
}
