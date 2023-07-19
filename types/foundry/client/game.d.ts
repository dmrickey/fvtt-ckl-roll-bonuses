interface Game {
    modules: {
        get(moduleId: string): {
            active: boolean,
            api,
        },
    };

    system: { version: string };

    /**
     * Client settings which are used to configure application behavior
     */
    settings: ClientSettings;

    /**
     * Localization support
     */
    i18n: Localization;
}
