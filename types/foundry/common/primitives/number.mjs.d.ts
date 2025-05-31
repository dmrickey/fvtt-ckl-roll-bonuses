export {};

declare global {
    interface Number {
        /**
         * A faster numeric between check which avoids type coercion to the Number object. Since this avoids coercion, if non-numbers are passed in unpredictable results will occur. Use with caution.
         * @param a - The lower-bound
         * @param b - The upper-bound
         * @param [inclusive = true] - Include the bounding values as a true result?
         * @returns Is the number between the two bounds?
         */
        between(a: number, b: number, inclusive?: boolean = true): boolean;
    }
}
