//// @ts-nocheck
/** copied from 5e */

import { api } from './api.mjs';

/**
 * A standardized helper function for simplifying the constant parts of a multipart roll formula.
 *
 * @param {string} formula                          The original roll formula.
 * @param {object} [options]                        Formatting options.
 * @param {boolean} [options.preserveFlavor=false]  Preserve flavor text in the simplified formula.
 * @param {boolean} [options.deterministic]         Strip any non-deterministic terms from the result.
 * @param {RollData} [options.rollData]             Strip any non-deterministic terms from the result.
 *
 * @returns {string}  The resulting simplified formula.
 */
export function simplifyRollFormula(formula, { preserveFlavor = false, deterministic = false, rollData = {} } = {}) {
    // Create a new roll and verify that the formula is valid before attempting simplification.
    let roll;
    try { roll = RollPF.create(formula, rollData); }
    catch (err) { console.warn(`Unable to simplify formula '${formula}': ${err}`); }
    if (!roll) return formula;
    Roll.validate(roll.formula);

    // Optionally strip flavor annotations.
    if (!preserveFlavor) roll.terms = Roll.parse(roll.formula.replace(RollTerm.FLAVOR_REGEXP, ""));
    if (deterministic) {
        // Remove non-deterministic terms and their preceding operators.
        const terms = [];
        for (let i = roll.terms.length - 1; i >= 0;) {
            let term = roll.terms[i];
            const deterministic = term.isDeterministic;
            if (deterministic) terms.unshift(term);
            term = roll.terms[--i];
            while (term instanceof foundry.dice.terms.OperatorTerm) {
                if (deterministic) terms.unshift(term);
                term = roll.terms[--i];
            }
        }
        roll.terms = terms;
    }

    // Perform arithmetic simplification on the existing roll terms.
    roll.terms = _simplifyOperatorTerms(roll.terms);

    // If the formula contains multiplication or division we cannot easily simplify
    if (/[*/]/.test(roll.formula)) {
        if (roll.isDeterministic && !/d\(/.test(roll.formula) && (!/\[/.test(roll.formula) || !preserveFlavor)) {
            return Roll.safeEval(roll.formula).toString();
        }
        else return roll.constructor.getFormula(roll.terms);
    }

    // Flatten the roll formula and eliminate string terms.
    roll.terms = _expandParentheticalTerms(roll.terms);
    roll.terms = Roll.simplifyTerms(roll.terms);

    // Group terms by type and perform simplifications on various types of roll term.
    let { poolTerms, diceTerms, mathTerms, numericTerms } = _groupTermsByType(roll.terms);
    numericTerms = _simplifyNumericTerms(numericTerms ?? []);
    diceTerms = _simplifyDiceTerms(diceTerms ?? []);

    // Recombine the terms into a single term array and remove an initial + operator if present.
    const simplifiedTerms = [diceTerms, poolTerms, mathTerms, numericTerms].flat().filter(Boolean);
    if (simplifiedTerms[0]?.operator === "+") simplifiedTerms.shift();
    return roll.constructor.getFormula(simplifiedTerms);
}

/* -------------------------------------------- */

/**
 * A helper function to perform arithmetic simplification and remove redundant operator terms.
 * @param {RollTerm[]} terms  An array of roll terms.
 * @returns {RollTerm[]}      A new array of roll terms with redundant operators removed.
 */
function _simplifyOperatorTerms(terms) {
    return terms.reduce((acc, term) => {
        const prior = acc[acc.length - 1];
        const ops = new Set([prior?.operator, term.operator]);

        // If one of the terms is not an operator, add the current term as is.
        if (ops.has(undefined)) acc.push(term);

        // Replace consecutive "+ -" operators with a "-" operator.
        else if ((ops.has("+")) && (ops.has("-"))) acc.splice(-1, 1, new foundry.dice.terms.OperatorTerm({ operator: "-" }));

        // Replace double "-" operators with a "+" operator.
        else if ((ops.has("-")) && (ops.size === 1)) acc.splice(-1, 1, new foundry.dice.terms.OperatorTerm({ operator: "+" }));

        // Don't include "+" operators that directly follow "+", "*", or "/". Otherwise, add the term as is.
        else if (!ops.has("+")) acc.push(term);

        return acc;
    }, []);
}

/* -------------------------------------------- */

/**
 * A helper function for combining unannotated numeric terms in an array into a single numeric term.
 * @param {object[]} terms  An array of roll terms.
 * @returns {object[]}      A new array of terms with unannotated numeric terms combined into one.
 */
function _simplifyNumericTerms(terms) {
    const simplified = [];
    const { annotated, unannotated } = _separateAnnotatedTerms(terms);

    // Combine the unannotated numerical bonuses into a single new NumericTerm.
    if (unannotated.length) {
        const staticBonus = Roll.safeEval(Roll.getFormula(unannotated));
        if (staticBonus === 0) return [...annotated];

        // If the staticBonus is greater than 0, add a "+" operator so the formula remains valid.
        if (staticBonus > 0) simplified.push(new foundry.dice.terms.OperatorTerm({ operator: "+" }));
        simplified.push(new foundry.dice.terms.NumericTerm({ number: staticBonus }));
    }
    return [...simplified, ...annotated];
}

/* -------------------------------------------- */

/**
 * A helper function to group dice of the same size and sign into single dice terms.
 * @param {object[]} terms  An array of DiceTerms and associated OperatorTerms.
 * @returns {object[]}      A new array of simplified dice terms.
 */
function _simplifyDiceTerms(terms) {
    const { annotated, unannotated } = _separateAnnotatedTerms(terms);

    // Split the unannotated terms into different die sizes and signs
    const diceQuantities = unannotated.reduce((obj, curr, i) => {
        if (curr instanceof foundry.dice.terms.OperatorTerm) return obj;
        const face = curr.constructor?.name === "Coin" ? "c" : curr.faces;
        const key = `${unannotated[i - 1].operator}${face}`;
        obj[key] = (obj[key] ?? 0) + curr.number;
        return obj;
    }, {});

    // Add new die and operator terms to simplified for each die size and sign
    const simplified = Object.entries(diceQuantities).flatMap(([key, number]) => ([
        new foundry.dice.terms.OperatorTerm({ operator: key.charAt(0) }),
        key.slice(1) === "c"
            ? new Coin({ number: number })
            : new Die({ number, faces: parseInt(key.slice(1)) })
    ]));
    return [...simplified, ...annotated];
}

/* -------------------------------------------- */

/**
 * A helper function to extract the contents of parenthetical terms into their own terms.
 * @param {RollTerm[]} terms  An array of roll terms.
 * @returns {RollTerm[]}      A new array of terms with no parenthetical terms.
 */
function _expandParentheticalTerms(terms) {
    terms = terms.reduce((acc, term) => {
        if (term instanceof foundry.dice.terms.ParentheticalTerm) {
            if (term.isDeterministic) term = new foundry.dice.terms.NumericTerm({ number: Roll.safeEval(term.term) });
            else {
                const subterms = new Roll(term.term).terms;
                term = _expandParentheticalTerms(subterms);
            }
        }
        acc.push(term);
        return acc;
    }, []);
    return _simplifyOperatorTerms(terms.flat());
}

/* -------------------------------------------- */

/**
 * A helper function to group terms into PoolTerms, DiceTerms, MathTerms, and NumericTerms.
 * MathTerms are included as NumericTerms if they are deterministic.
 * @param {RollTerm[]} terms  An array of roll terms.
 * @returns {object}          An object mapping term types to arrays containing roll terms of that type.
 */
function _groupTermsByType(terms) {
    // Add an initial operator so that terms can be rearranged arbitrarily.
    if (!(terms[0] instanceof foundry.dice.terms.OperatorTerm)) terms.unshift(new foundry.dice.terms.OperatorTerm({ operator: "+" }));

    return terms.reduce((obj, term, i) => {
        let type;
        if (term instanceof foundry.dice.terms.DiceTerm) type = foundry.dice.terms.DiceTerm;
        else if ((term instanceof foundry.dice.terms.FunctionTerm) && (term.isDeterministic)) type = foundry.dice.terms.NumericTerm;
        else type = term.constructor;
        const key = `${type.name.charAt(0).toLowerCase()}${type.name.substring(1)}s`;

        // Push the term and the preceding OperatorTerm.
        (obj[key] = obj[key] ?? []).push(terms[i - 1], term);
        return obj;
    }, {});
}

/* -------------------------------------------- */

/**
 * A helper function to separate annotated terms from unannotated terms.
 * @param {object[]} terms     An array of DiceTerms and associated OperatorTerms.
 * @returns {Array | Array[]}  A pair of term arrays, one containing annotated terms.
 */
function _separateAnnotatedTerms(terms) {
    return terms.reduce((obj, curr, i) => {
        if (curr instanceof foundry.dice.terms.OperatorTerm) return obj;
        obj[curr.flavor ? "annotated" : "unannotated"].push(terms[i - 1], curr);
        return obj;
    }, { annotated: [], unannotated: [] });
}

api.utils.simplifyRollFormula = simplifyRollFormula;
/**
 * @internal
 * @typedef {RollTerm|FormulaPart} AnyTerm
 */

/**
 * Removes flairs from a formula.
 *
 * @param {string} formula Formula
 * @returns {string} Stripped formula
 */
export const unflair = (formula) => formula.replace(/\[[^\]]*]/g, "");

/**
 * Compress basic math and space in produced formula.
 *
 * @param {string} formula - Formula to compress
 * @returns {string} - Compressed formula
 */
export const compress = (formula) =>
    formula
        .replace(/\s+/g, "") // remove whitespaces
        .replace(/\+-/g, "-") // + -n = -n
        .replace(/--/g, "+") // - -n = +n
        .replace(/-\+/g, "-") // - +n = -n
        .replace(/\+\++/g, "+"); // + +n = +n

/**
 * @param {AnyTerm} t
 * @returns {boolean}
 */
const isSimpleTerm = (t) => t instanceof foundry.dice.terms.NumericTerm || t?.simple || false;

class FormulaPart {
    /** @type {AnyChunk[]} */
    terms = [];
    simple = false;
    preserveFlavor = false;

    constructor(terms = [], { preserveFlavor = false, simple = false } = {}) {
        this.preserveFlavor = preserveFlavor;
        this.terms = terms.filter((t) => !!t);
        this.simple = simple;
    }

    get isDeterministic() {
        return this.terms.every((t) => t.isDeterministic);
    }

    get formula() {
        const f = this.terms
            .map((t) => {
                if (t.constructor.isFunction) return `${t.simplify}`;
                else if (t.isDeterministic) return `${t.total}${((this.preserveFlavor && t.flavor) ? `[${t.flavor}]` : '')}`;
                else return t.formula;
            })
            .join("");

        const roll = Roll.create(f);
        if (roll.isDeterministic) return roll.evaluateSync().total.toString();
        else return f;
    }

    get total() {
        const roll = Roll.create(this.formula);
        roll.evaluateSync({ forceSync: true });
        return roll.total;
    }
}

/**
 * Combine ["-", term] into single {@link FormulaPart}
 *
 * @param {AnyTerm[]} terms
 */
function negativeTerms(terms) {
    const nterms = [];
    while (terms.length) {
        const term = terms.shift();
        if (term instanceof foundry.dice.terms.OperatorTerm && term.operator === "-") {
            // Add preceding + if operators are fully consumed
            if (!(nterms.at(-1) instanceof foundry.dice.terms.OperatorTerm)) {
                const nt = new foundry.dice.terms.OperatorTerm({ operator: "+" });
                nt.evaluateSync({ forceSync: true });
                nterms.push(nt);
            }
            nterms.push(new FormulaPart([term, terms.shift()], true));
        } else nterms.push(term);
    }
    return nterms;
}

/**
 *
 * @param {AnyTerm[]} terms
 */
function stringTerms(terms) {
    const nterms = [];
    while (terms.length) {
        const term = terms.shift();
        if (term instanceof StringTerm) {
            // Partial dice terms combine left
            if (/^d\d/.test(term.expression)) {
                nterms.push(new FormulaPart([nterms.pop(), term]));
            }
            // Rest combine right
            else {
                nterms.push(new FormulaPart([term, terms.shift()]));
            }
        } else nterms.push(term);
    }
    return nterms;
}

/**
 * Combine [term, operator, term] cases into singular {@link FormulaPart}
 *
 * @param {AnyTerm[]} terms - Terms to combine
 * @param {string[]} operators - Operators to look for
 * @param {object} options
 * @param {boolean} options.preserveFlavor - Only combine terms with matching flavor
 * @param {boolean} [options.simpleOnly] - Only combine simple terms
 * @returns {AnyTerm[]} - Product
 */
function triTermOps(terms, operators, { preserveFlavor, simpleOnly = false }) {
    const eterms = [];
    while (terms.length) {
        const term = terms.shift();
        if (term instanceof foundry.dice.terms.OperatorTerm && operators.includes(term.operator)) {
            // Only combine simple terms
            if (simpleOnly && !(isSimpleTerm(eterms.at(-1)) && isSimpleTerm(terms[0]))) {
                // Fall through
            }
            else if (preserveFlavor && eterms.at(-1).flavor != terms[0].flavor) {
                // Fall through
            }
            // Combine all
            else {
                const left = eterms.pop(),
                    right = terms.shift();
                eterms.push(new FormulaPart([left, term, right], isSimpleTerm(left) && isSimpleTerm(right)));
                continue;
            }
        }
        eterms.push(term);
    }

    return eterms;
}

/**
 * Ternary wrapper
 */
class TernaryTerm {
    /** @type {RollTerm|FormulaPart}  */
    condition;
    /** @type {RollTerm|FormulaPart}  */
    ifTrue;
    /** @type {RollTerm|FormulaPart}  */
    ifFalse;

    constructor(condition, ifTrue, ifFalse) {
        if (!(condition instanceof FormulaPart))
            condition = new FormulaPart(Array.isArray(condition) ? condition : [condition]);
        this.condition = condition;

        if (!(ifTrue instanceof FormulaPart)) ifTrue = new FormulaPart(Array.isArray(ifTrue) ? ifTrue : [ifTrue]);
        this.ifTrue = ifTrue;

        if (!(ifFalse instanceof FormulaPart)) ifFalse = new FormulaPart(Array.isArray(ifFalse) ? ifFalse : [ifFalse]);
        this.ifFalse = ifFalse;
    }

    get isDeterministic() {
        return Roll.create(this.formula).isDeterministic;
    }

    get formula() {
        if (this.condition.isDeterministic) {
            if (this.condition.total) {
                return this.ifTrue.formula;
            } else {
                return this.ifFalse.formula;
            }
        } else return [this.condition.formula, "?", this.ifTrue.formula, ":", this.ifFalse.formula].join(" ");
    }

    get total() {
        return Roll.create(this.formula).evaluateSync({ forceSync: true }).total;
    }
}

/**
 * Convert ternaries into {@link TernaryTerm}s
 *
 * @param {AnyTerm[]} terms - Terms to look ternaries from.
 * @returns {AnyTerm[]} - Product
 */
function ternaryTerms(terms) {
    const tterms = [];
    while (terms.length) {
        let term = terms.shift();
        if (term instanceof foundry.dice.terms.OperatorTerm && term.operator === "?") {
            const cond = tterms.pop();
            const ifTrue = [];
            while (terms.length) {
                term = terms.shift();
                const endTern = term instanceof foundry.dice.terms.OperatorTerm && term.operator === ":";
                if (endTern) break;
                ifTrue.push(term);
            }
            const ifFalse = terms.shift();
            tterms.push(new TernaryTerm(cond, ifTrue, ifFalse));
        } else tterms.push(term);
    }
    return tterms;
}

/**
 * Simplifies formula to very basic level.
 *
 * @param {string} formula - Formula
 * @param {object} [rollData={}] - Roll data
 * @param {object} [options] - Additional options
 * @param {boolean} [options.strict] - Attempt to return something even slightly valid even with bad formulas
 * @param {boolean} [options.preserveFlavor] - Only combine terms with matching flavor
 * @returns {string} - Simpler formula
 * @throws {Error} - On invalid formula
 */
export function simplify(formula, rollData = {}, { strict = true, preserveFlavor = false } = {}) {
    formula = preserveFlavor ? formula : unflair(formula);
    formula = compress(Roll.replaceFormulaData(formula, rollData, { missing: 0 }));

    // Produce nicer formula
    formula = Roll.defaultImplementation
        .parse(formula)
        .map((t) => {
            if (t instanceof foundry.dice.terms.ParentheticalTerm) {
                t.evaluateSync({ forceSync: true });
                const v = t.total;
                return v >= 0 ? `${t.total}` : `(${t.total})`;
            }
            return t.formula;
        })
        .join("");

    const roll = new Roll.defaultImplementation(formula);

    // Evaluate
    // TODO: v12 this needs to call .evaluateSync()
    try {
        roll.evaluate({ minimize: true });
    } catch (err) {
        if (strict) throw err;
        else return compress(formula);
    }
    // Old evaluation, fails with parenthetical terms followed by d6 or the like
    //terms.forEach((term) => term.evaluate({ minimize: true }));
    let terms = roll.terms;

    // Negatives (combine - with the following term)
    terms = negativeTerms(terms);

    // PEMDAS
    // Foundry doesn't support juxtaposition so it's not handled here

    // Exponents
    terms = triTermOps(terms, ["**"], { preserveFlavor });
    // Multiply/Divide
    terms = triTermOps(terms, ["/", "*"], { preserveFlavor });
    // Conditionals
    terms = triTermOps(terms, ["==", "===", ">", ">=", "<", "<=", "!=", "!=="], { preserveFlavor });
    // Plus/Minus
    terms = triTermOps(terms, ["+", "-"], { preserveFlavor, simpleOnly: true });
    // String terms
    terms = stringTerms(terms);
    // Ternaries
    terms = ternaryTerms(terms);

    // Make final pass
    const final = new FormulaPart(terms, { preserveFlavor });

    return final.formula.replace(/ \+ 0\b/g, "");
}

api.utils.simplify = simplify;
