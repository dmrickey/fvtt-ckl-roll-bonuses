/**
 * @param {string} formula
 * @returns {string}
 */
export const getFirstTermFormula = (formula) => {
    if (!formula?.trim()) return '';

    const tree = foundry.dice.RollGrammar.parse(formula);

    if (tree.class !== "Node") {
        return formula.trim();
    }

    let first = '';
    let counter = 0;
    let node = tree.operands[0];
    while (counter++ < 10) {
        if (node.class === "Node") {
            console.log(node.operands);
            node = node.operands[0];
        }
        else if (node.class === "StringTerm") {
            first = node.term;
            break;
        }
        else {
            first = node.formula;
            break;
        }
    }

    return first.trim();
};

/**
 * @param {string} formula
 * @param {object} options
 * @param {boolean} [options.excludeFirst] - Whether to exclude the first term.
 * @param {boolean} [options.ensureLeadingSign] - Whether to include the leading sign of the first deterministic term.
 * @returns {string}
 */
export const getDeterministicPartsFormula = (formula, { excludeFirst = false, ensureLeadingSign = true } = {}) => {
    const firstTerm = getFirstTermFormula(formula);
    const formulaToExtract = excludeFirst ? formula.replace(firstTerm, '').trim() : formula;

    if (!formulaToExtract) return '';

    const extracted = extractDeterministic(formulaToExtract);
    return ensureLeadingSign && extracted && !extracted.startsWith('-') ? `+ ${extracted}` : extracted;
};

/**
 * @param {string} formula
 * @returns {string}
 */
const extractDeterministic = (formula) => {
    const tree = foundry.dice.RollGrammar.parse(formula);
    const filtered = filterNode(tree);
    return filtered ? buildFormula(filtered).trim() : '';
}

/**
 * Recursively removes non-deterministic branches.
 *
 * @param {DiceNode | DiceTerm | StringTerm} node
 * @returns {DiceNode | DiceTerm | StringTerm | null}
 */
const filterNode = (node) => {
    // DiceTerm branch
    if (node.class === 'StringTerm') {
        return node;
    }
    if (node.class !== "Node") {
        return Roll.create(node.formula).isDeterministic ? node : null;
    }

    // DiceNode branch
    const [left, right] = node.operands;

    const filteredLeft = filterNode(left);
    const filteredRight = filterNode(right);

    if (filteredLeft && filteredRight) {
        return {
            class: "Node",
            operator: node.operator,
            operands: [filteredLeft, filteredRight],
            formula: `${buildFormula(filteredLeft)} ${node.operator} ${buildFormula(filteredRight)}`,
        };
    }

    if (filteredLeft) return filteredLeft;

    if (filteredRight) {
        return {
            class: 'StringTerm',
            term: ` ${node.operator} ${buildFormula(filteredRight)}`,
        };
    }

    return null;
}

/**
 * Rebuilds the formula string from the filtered tree.
 *
 * @param {DiceNode | DiceTerm | StringTerm} node
 * @returns {string}
 */
const buildFormula = (node) => {
    if (node.class === 'StringTerm') {
        return node.options?.flavor
            ? `${node.term}[${node.options.flavor}]`
            : node.term;
    }

    return node.formula;
}