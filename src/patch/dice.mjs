// @ts-nocheck

// adds a forceSync roll option to force the roll to evaluate without external rollers

import { MODULE_NAME } from '../consts.mjs';

function Roll_evaluateSync(options = {}) {
    /** begin override to set default otions */
    if (options.minimize === undefined) options.minimize = false;
    if (options.maximize === undefined) options.maximize = false;
    if (options.allowStrings === undefined) options.allowStrings = false;
    if (options.strict === undefined) options.strict = true;
    /** end override to set default otions */

    if (this._evaluated) {
        throw new Error(`The ${this.constructor.name} has already been evaluated and is now immutable.`);
    }
    this._evaluated = true;
    if (CONFIG.debug.dice) console.debug(`Synchronously evaluating roll with formula "${this.formula}"`);
    return this._evaluateSync(options); // override pass all options
}

/**
* Evaluate an AST synchronously.
* @param {RollParseNode|RollTerm} node     The root node or term.
* @param {object} [options]                Options which inform how evaluation is performed
* @param {boolean} [options.minimize]      Force the result to be minimized
* @param {boolean} [options.maximize]      Force the result to be maximized
* @param {boolean} [options.strict]        Throw an error if encountering a term that cannot be synchronously
*                                          evaluated.
* @param {boolean} [options.allowStrings]  If true, string terms will not cause an error to be thrown during
*                                          evaluation.
* @returns {string|number}
* @protected
*/
function _Roll_evaluateASTSync(node, options = {}) {
    const { strict } = options;
    if (node.class !== "Node") {
        if (node._evaluated) return node.total;
        if (foundry.dice.terms.RollTerm.isDeterministic(node, options)) { // override is to pass all options
            node.evaluate(options);
            return node.total;
        }
        if (strict) throw new Error("This Roll contains terms that cannot be synchronously evaluated.");
        return 0;
    }

    let [left, right] = node.operands;
    [left, right] = [this._evaluateASTSync(left, options), this._evaluateASTSync(right, options)];

    switch (node.operator) {
        case "-": return left - right;
        case "*": return left * right;
        case "/": return left / right;
        case "%": return left % right;

        // Treat an unknown operator as addition.
        default: return left + right;
    }
}

/**
 * Determine if evaluating a given RollTerm with certain evaluation options can be done so deterministically.
 * @param {RollTerm} term               The term.
 * @param {object} [options]            Options for evaluating the term.
 * @param {boolean} [options.maximize]  Force the result to be maximized.
 * @param {boolean} [options.minimize]  Force the result to be minimized.
 */
function RollTerm_isDeterministic(wrapped, term, options) {
    return options.forceSync || wrapped(term, options);
}

/**
 * Evaluate deterministic values of this term synchronously.
 * @param {object} [options]
 * @param {boolean} [options.maximize]  Force the result to be maximized.
 * @param {boolean} [options.minimize]  Force the result to be minimized.
 * @param {boolean} [options.strict]    Throw an error if attempting to evaluate a die term in a way that cannot be
 *                                      done synchronously.
 * @returns {DiceTerm}
 * @protected
 */
function _DiceTerm_evaluateSync(options = {}) {
    if (this._faces instanceof Roll) this._faces.evaluateSync(options);
    if (this._number instanceof Roll) this._number.evaluateSync(options);
    if (Math.abs(this.number) > 999) {
        throw new Error("You may not evaluate a DiceTerm with more than 999 requested results");
    }
    for (let n = this.results.length; n < Math.abs(this.number); n++) {
        const roll = { active: true };
        if (options.minimize) roll.result = Math.min(1, this.faces);
        else if (options.maximize) roll.result = this.faces;
        else if (options.forceSync) {
            roll.result = this.randomFace();
            if (this instanceof foundry.dice.terms.FateDie) {
                if (roll.result === -1) roll.failure = true;
                if (roll.result === 1) roll.success = true;
            }
        }
        else if (options.strict) throw new Error("Cannot synchronously evaluate a non-deterministic term.");
        else continue;
        this.results.push(roll);
    }
    return this;
}

Hooks.once('init', () => {
    // make sure options are passed through
    libWrapper.register(MODULE_NAME, 'Roll.prototype.evaluateSync', Roll_evaluateSync, libWrapper.OVERRIDE);
    libWrapper.register(MODULE_NAME, 'Roll.prototype._evaluateASTSync', _Roll_evaluateASTSync, libWrapper.OVERRIDE);
    libWrapper.register(MODULE_NAME, 'foundry.dice.terms.RollTerm.isDeterministic', RollTerm_isDeterministic, libWrapper.MIXED);

    // force rolling in sync cases
    libWrapper.register(MODULE_NAME, 'foundry.dice.terms.DiceTerm.prototype._evaluateSync', _DiceTerm_evaluateSync, libWrapper.OVERRIDE);
});
