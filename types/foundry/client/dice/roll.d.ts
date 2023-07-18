export { }

declare global {
    /**
     * An interface and API for constructing and evaluating dice rolls.
     * The basic structure for a dice roll is a string formula and an object of data against which to parse it.
     *
     * @typeParam D - the type of data object against which to parse attributes within the formula
     *
     * @example Attack with advantage!
     * ```typescript
     * let r = new Roll("2d20kh + @prof + @strMod", {prof: 2, strMod: 4});
     *
     * // The parsed terms of the roll formula
     * console.log(r.terms);    // [Die, OperatorTerm, NumericTerm, OperatorTerm, NumericTerm]
     *
     * // Execute the roll
     * await r.evaluate();
     *
     * // The resulting equation after it was rolled
     * console.log(r.result);   // 16 + 2 + 4
     *
     * // The total resulting from the roll
     * console.log(r.total);    // 22
     * ```
     */
    class Roll {
        /**
         * @param formula - The string formula to parse
         * @param data    - The data object against which to parse attributes within the formula
         *                  (default: `{}`)
         * @param options - (default: `{}`)
         */
        constructor(formula: string, data?: D, options?: {});

        /**
         * Execute the Roll, replacing dice and evaluating the total result
         * @param options - Options which inform how the Roll is evaluated
         *                  (default: `{}`)
         * @returns The evaluated Roll instance
         *
         * @example Evaluate a Roll expression
         * ```typescript
         * let r = new Roll("2d6 + 4 + 1d4");
         * await r.evaluate();
         * console.log(r.result); // 5 + 4 + 2
         * console.log(r.total);  // 11
         * ```
         */
        evaluate(arg: { async: boolean; }): this;

        /**
         * Alias for evaluate.
         * @see Roll#evaluate
         */
        roll(arg: { async: boolean; }): this;

        /**
         * Return an Array of the individual DiceTerm instances contained within this Roll.
         */
        get dice(): DiceTerm[];
    }

    class DiceTerm {
        /**
         * An Array of dice term modifiers which are applied
         */
        modifiers: string[];


        /**
         * The number of dice of this term to roll, before modifiers are applied
         */
        number: number;

        /**
         * The number of faces on the die
         */
        faces: number;

        /**
         * The array of dice term results which have been rolled
         */
        results: Result[];

        options: unknown;
    }
}
