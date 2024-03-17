interface Game {
    /**
     * Localization support
     */
    i18n: Localization;

    modules: {
        get(moduleId: string): {
            active?: boolean;
            api?: any;
        };
    };

    /**
     * @returns {boolean} True if the game has already fired the 'ready' hook
     */
    ready: boolean;

    system: { version: string };

    scenes: {
        active: {
            tokens: EmbeddedCollection<TokenDocumentPF>;
        };
    };

    /**
     * Client settings which are used to configure application behavior
     */
    settings: ClientSettings;

    user: User;
    userId: string;
}
