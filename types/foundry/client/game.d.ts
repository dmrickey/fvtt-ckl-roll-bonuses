interface Game {
    messages: EmbeddedCollection<ChatMessagePF>;
    actors: EmbeddedCollection<ActorPF>;

    combats: {
        /** Gets the combat for the current scene */
        active: CombatPF | undefined;
    };

    /** @remarks Initialized between the `"setup"` and `"ready"` hook events. */
    items?: EmbeddedCollection<ItemPF>;

    /**
     * Localization support
     */
    i18n: Localization;

    modules: {
        get(moduleId: string): {
            active?: boolean;
            api?: any;

            /** mod is fully ready and the api can be used safely */
            ready?: boolean;
        };
    };

    packs: EmbeddedCollection<Pack>;

    /**
     * @returns {boolean} True if the game has already fired the 'ready' hook
     */
    ready: boolean;

    system: { version: string };

    scenes: EmbeddedCollection<Scene> & {
        /** @deprecated Do not use, base everything on the token or user's scene */
        active: Scene;
        current: Scene;
    };

    /**
     * Client settings which are used to configure application behavior
     */
    settings: ClientSettings;

    time: { worldTime: number };

    user: User;
    users: { activeGM: user } & EmbeddedCollection<User>;
    userId: string;
}

interface Pack<T extends Document = Document> {
    documentName: string;
    locked: boolean;

    getDocuments(): Promise<EmbeddedCollection<Document>>;
    updateAll(func: (Document) => void): Promise<void>;
}

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
