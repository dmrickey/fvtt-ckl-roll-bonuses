/**
 * @param {string} formula
 * @param {RollData} rollData
 * @returns {string}
 */
export const getFirstTermFormula = (formula, rollData) => {
    const roll = RollPF.create(formula, rollData);
    const terms = roll.terms.filter(x => !(x instanceof foundry.dice.terms.OperatorTerm));
    const term = terms[0] || { formula: '' };
    const output = term.formula?.trim() || '';

    return term instanceof foundry.dice.terms.ParentheticalTerm
        ? `(${output})`
        : output;
}