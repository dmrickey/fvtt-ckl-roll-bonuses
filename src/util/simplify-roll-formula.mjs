// @ts-nocheck
/** copied from 5e */

import { api } from './api.mjs';
const {
    Coin, DiceTerm, Die, FunctionTerm, NumericTerm, OperatorTerm, ParentheticalTerm, RollTerm
} = foundry.dice.terms;

/**
 * A standardized helper function for simplifying the constant parts of a multipart roll formula.
 *
 * @param {string} formula                          The original roll formula.
 * @param {object} [options]                        Formatting options.
 * @param {boolean} [options.preserveFlavor=false]  Preserve flavor text in the simplified formula.
 * @param {boolean} [options.deterministic]         Strip any non-deterministic terms from the result.
 * @param {RollData} [options.rollData]
 *
 * @returns {string}  The resulting simplified formula.
 */
export function simplifyRollFormula(formula, rollData = {}, { preserveFlavor = false, deterministic = false } = {}) {
    // Create a new roll and verify that the formula is valid before attempting simplification.
    let roll;
    try { roll = new Roll(formula, rollData); }
    catch (err) { console.warn(`Unable to simplify formula '${formula}': ${err}`); }
    Roll.validate(roll.formula);

    // Optionally strip flavor annotations.
    if (!preserveFlavor) roll.terms = Roll.parse(roll.formula.replace(RollTerm.FLAVOR_REGEXP, ""));

    if (deterministic) {
        // Perform arithmetic simplification to simplify parsing through the terms.
        roll.terms = _simplifyOperatorTerms(roll.terms);

        // Remove non-deterministic terms, their preceding operators, and dependent operators/terms.
        const terms = [];
        let temp = [];
        let multiplicative = false;
        let determ;

        for (let i = roll.terms.length - 1; i >= 0;) {
            let paren;
            let term = roll.terms[i];
            if (term instanceof ParentheticalTerm) {
                paren = simplifyRollFormula(term.term, { preserveFlavor, deterministic });
            }
            if (Number.isNumeric(paren)) {
                const termData = { number: paren };
                if (preserveFlavor) termData.options = { flavor: term.flavor };
                term = new NumericTerm(termData);
            }
            determ = term.isDeterministic && (!multiplicative || determ);
            if (determ) temp.unshift(term);
            else temp = [];
            term = roll.terms[--i];
            while (term instanceof OperatorTerm) {
                if (determ) temp.unshift(term);
                if ((term.operator === "*") || (term.operator === "/") || (term.operator === "%")) multiplicative = true;
                else {
                    multiplicative = false;
                    while (temp.length) terms.unshift(temp.pop());
                }
                term = roll.terms[--i];
            }
        }
        if (determ) {
            while (temp.length) terms.unshift(temp.pop());
        }
        roll.terms = terms;
    }

    // Perform arithmetic simplification on the existing roll terms.
    roll.terms = _simplifyOperatorTerms(roll.terms);

    // If the formula contains multiplication or division we cannot easily simplify
    if (/[*/]/.test(roll.formula)) {
        if (roll.isDeterministic && !/d\(/.test(roll.formula) && (!/\[/.test(roll.formula) || !preserveFlavor)) {
            return String(new Roll(roll.formula).evaluateSync({ maximize: true }).total);
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
        else if ((ops.has("+")) && (ops.has("-"))) acc.splice(-1, 1, new OperatorTerm({ operator: "-" }));

        // Replace double "-" operators with a "+" operator.
        else if ((ops.has("-")) && (ops.size === 1)) acc.splice(-1, 1, new OperatorTerm({ operator: "+" }));

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
        const staticBonus = RollPF.create(Roll.getFormula(unannotated)).evaluateSync({ maximize: true }).total;
        if (staticBonus === 0) return [...annotated];

        // If the staticBonus is greater than 0, add a "+" operator so the formula remains valid.
        simplified.push(new OperatorTerm({ operator: staticBonus < 0 ? "-" : "+" }));
        simplified.push(new NumericTerm({ number: Math.abs(staticBonus) }));
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
        if (curr instanceof OperatorTerm) return obj;
        const isCoin = curr.constructor?.name === "Coin";
        const face = isCoin ? "c" : curr.faces;
        const modifiers = isCoin ? "" : curr.modifiers.filterJoin("");
        const key = `${unannotated[i - 1].operator}${face}${modifiers}`;
        obj[key] ??= {};
        if ((curr._number instanceof Roll) && (curr._number.isDeterministic)) curr._number.evaluateSync({ maximize: true });
        obj[key].number = (obj[key].number ?? 0) + curr.number;
        if (!isCoin) obj[key].modifiers = (obj[key].modifiers ?? []).concat(curr.modifiers);
        return obj;
    }, {});

    // Add new die and operator terms to simplified for each die size and sign
    const simplified = Object.entries(diceQuantities).flatMap(([key, { number, modifiers }]) => ([
        new OperatorTerm({ operator: key.charAt(0) }),
        key.slice(1) === "c"
            ? new Coin({ number: number })
            : new Die({ number, faces: parseInt(key.slice(1)), modifiers: [...new Set(modifiers)] })
    ]));
    return [...simplified, ...annotated];
}

/* -------------------------------------------- */

/**
 * A helper function to extract the contents of parenthetical terms into their own terms.
 * @param {object[]} terms  An array of roll terms.
 * @returns {object[]}      A new array of terms with no parenthetical terms.
 */
function _expandParentheticalTerms(terms) {
    terms = terms.reduce((acc, term) => {
        if (term instanceof ParentheticalTerm) {
            if (term.isDeterministic) {
                const roll = new Roll(term.term);
                term = new NumericTerm({ number: roll.evaluateSync({ maximize: true }).total });
            } else {
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
 * A helper function to group terms into PoolTerms, DiceTerms, FunctionTerms, and NumericTerms.
 * FunctionTerms are included as NumericTerms if they are deterministic.
 * @param {RollTerm[]} terms  An array of roll terms.
 * @returns {object}          An object mapping term types to arrays containing roll terms of that type.
 */
function _groupTermsByType(terms) {
    // Add an initial operator so that terms can be rearranged arbitrarily.
    if (!(terms[0] instanceof OperatorTerm)) terms.unshift(new OperatorTerm({ operator: "+" }));

    return terms.reduce((obj, term, i) => {
        let type;
        if (term instanceof DiceTerm) type = DiceTerm;
        else if ((term instanceof FunctionTerm) && (term.isDeterministic)) type = NumericTerm;
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
        if (curr instanceof OperatorTerm) return obj;
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
 * @param {AnyTerm} t - Term to test
 * @returns {boolean} - Is deemed simple.
 */
const isSimpleTerm = (t) => t instanceof foundry.dice.terms.NumericTerm || t?.simple || false;

class FormulaPart {
    /** @type {AnyChunk[]} */
    terms = [];
    simple = false;

    constructor(terms = [], simple = false, evaluate = true) {
        this.terms = terms.filter((t) => !!t);
        this.simple = simple;

        if (evaluate) this.evaluate();
    }

    get isDeterministic() {
        return this.terms.every((t) => t.isDeterministic);
    }

    #formula;
    get formula() {
        if (this.#formula) return this.#formula;

        const f = this.terms
            .map((t) => {
                if (t.isDeterministic) return `${t.total}`;
                else if (t instanceof foundry.dice.terms.FunctionTerm) return `${t.simplify || t.expression}`;
                // Dice eat up prefix parentheticals in v12
                else if (
                    t instanceof foundry.dice.terms.Die &&
                    t._number instanceof Roll &&
                    t._number.terms.length == 1 &&
                    t._number.terms[0] instanceof foundry.dice.terms.ParentheticalTerm
                ) {
                    // Simplify prefix parenthetical part of (X)dY
                    const formula = t._number.terms[0].roll.formula;
                    const iformula = simplify(formula);
                    t._number = new Roll.defaultImplementation(iformula).evaluateSync({ maximize: true });
                    return t.formula;
                } else {
                    return t.formula;
                }
            })
            .join("");

        const roll = new Roll.defaultImplementation(f);
        if (roll.isDeterministic) this.#formula = roll.evaluateSync({ minimize: true }).total.toString();
        else this.#formula = f;

        return this.#formula;
    }

    _total = null;

    evaluate() {
        const roll = new Roll.defaultImplementation(this.formula).evaluateSync({ minimize: true });
        this._total = roll.total;
    }

    get total() {
        if (this._total === null) {
            console.error("Must be evaluated first!", this);
            throw new Error("Must be evaluated first!");
        }
        return this._total;
    }
}

/**
 * Combine ["-", term] into single {@link FormulaPart}
 *
 * @param {AnyTerm[]} terms - Terms to handle
 * @returns {Array<AnyTerm>} - New terms
 */
function negativeTerms(terms) {
    const nterms = [];
    while (terms.length) {
        const term = terms.shift();
        if (term instanceof foundry.dice.terms.OperatorTerm && term.operator === "-") {
            // Add preceding + if operators are fully consumed
            if (!(nterms.at(-1) instanceof foundry.dice.terms.OperatorTerm)) {
                const nt = new foundry.dice.terms.OperatorTerm({ operator: "+" });
                nt._evaluated = true;
                nterms.push(nt);
            }
            nterms.push(new FormulaPart([term, terms.shift()], true));
        } else nterms.push(term);
    }
    return nterms;
}

/**
 *
 * @param {AnyTerm[]} terms - Terms to handle
 * @returns {Array<AnyTerm>} - Reduced terms
 */
function stringTerms(terms) {
    const nterms = [];
    while (terms.length) {
        const term = terms.shift();
        if (term instanceof foundry.dice.terms.StringTerm) {
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
 * @param {boolean} simpleOnly - Only combine simple terms
 * @returns {AnyTerm[]} - Product
 */
function triTermOps(terms, operators, simpleOnly = false) {
    const eterms = [];
    while (terms.length) {
        const term = terms.shift();
        if (term instanceof foundry.dice.terms.OperatorTerm && operators.includes(term.operator)) {
            // Only combine simple terms
            if (simpleOnly && !(isSimpleTerm(eterms.at(-1)) && isSimpleTerm(terms[0]))) {
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
 * Replace 0dX with 0
 *
 * Alters terms in-place.
 *
 * @param {foundry.dice.terms.RollTerm[]} terms - Term array
 * @returns {foundry.dice.terms.RollTerm[]} - Same term array as it was given.
 */
function replaceZeroDice(terms) {
    for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        if (term instanceof foundry.dice.terms.Die && term.number === 0) {
            terms.splice(i, 1, foundry.dice.terms.RollTerm.fromData({ number: 0, class: "NumericTerm", _evaluated: true }));
        }
    }

    return terms;
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
export function simplify(formula, rollData = {}, { preserveFlavor = false, strict = true } = {}) {
    formula = preserveFlavor ? formula : unflair(formula);
    formula = compress(Roll.replaceFormulaData(formula, rollData, { missing: 0 }));

    // Produce nicer formula
    formula = Roll.defaultImplementation
        .parse(formula)
        .map((t) => {
            if (t instanceof foundry.dice.terms.ParentheticalTerm) {
                if (t.isDeterministic) {
                    // Parenthetical term doesn't have separate evaluate calls yet
                    t.evaluate({ minimize: true });
                    const v = t.total;
                    return `${v}`;
                } else {
                    const iformula = simplify(t.roll.formula);
                    const isSingleTerm = Roll.defaultImplementation.parse(iformula).length === 1;
                    if (isSingleTerm) return iformula;
                    else return `(${iformula})`;
                }
            }
            return t.formula;
        })
        .join("");

    const roll = new Roll.defaultImplementation(formula);

    // Evaluate
    try {
        roll.evaluateSync({ minimize: true });
    } catch (err) {
        if (strict) throw err;
        else return compress(formula);
    }

    // Old evaluation, fails with parenthetical terms followed by d6 or the like
    //terms.forEach((term) => term.evaluateSync({ minimize: true }));
    let terms = replaceZeroDice(roll.terms);

    // Negatives (combine - with the following term)
    terms = negativeTerms(terms);

    // PEMDAS
    // Foundry doesn't support juxtaposition so it's not handled here

    // Exponents
    terms = triTermOps(terms, ["**"]);
    // Multiply/Divide
    terms = triTermOps(terms, ["/", "*"]);
    // Conditionals
    terms = triTermOps(terms, ["==", "===", ">", ">=", "<", "<=", "!=", "!=="]);
    // Plus/Minus
    terms = triTermOps(terms, ["+", "-"], true);
    // String terms
    terms = stringTerms(terms);

    // Make final pass
    const final = new FormulaPart(terms, undefined, false);

    return final.formula.replace(/ \+ 0\b/g, "");
}

api.utils.simplify = simplify;
