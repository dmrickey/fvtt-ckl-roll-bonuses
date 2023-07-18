export { }

declare global {
    interface Math {
        /**
         * Bound a number between some minimum and maximum value, inclusively
         * @param num - The current value
         * @param min - The minimum allowed value
         * @param max - The maximum allowed value
         * @returns The clamped number
         */
        clamped(num: number, min: number, max: number): number;
    }
}
