interface Scene extends BaseDocument {
    grid: {
        /**
         * Measure a shortest, direct path through the given waypoints.
         * @param {{x: number, y: number}[]} waypoints           The waypoints the path must pass through
         * @param {unknown} [options]                              Additional measurement options
         * @param {unknown} [options.cost]    The function that returns the cost
         *   for a given move between grid spaces (default is the distance travelled along the direct path)
         * @returns {GridMeasurePathResult}        The measurements a shortest, direct path through the given waypoints.
         */
        measurePath(
            waypoints,
            options: { cost: ValueOf<CONST['GRID_DIAGONALS']> } = {}
        ): GridMeasurePathResult;
        alpha: number;
        color: string;
        distance: number;
        size: number;
        type: number;
        unites: string;
    };
    tokens: EmbeddedCollection<TokenDocumentPF>;
}
