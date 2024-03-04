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

    system: { version: string };

    scenes: {
        active: {
            tokens: EmbeddedCollection<TokenPF>;
        };
    };

    /**
     * Client settings which are used to configure application behavior
     */
    settings: ClientSettings;

    user: User;
    userId: string;
}
