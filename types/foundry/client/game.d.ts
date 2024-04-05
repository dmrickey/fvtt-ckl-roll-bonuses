interface Game {
    actors: EmbeddedCollection<ActorPF>;
    /**
     * @remarks Initialized between the `"setup"` and `"ready"` hook events.
     */
    items?: EmbeddedCollection<ItemPF>;

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

    packs: EmbeddedCollection<Pack>;

    /**
     * @returns {boolean} True if the game has already fired the 'ready' hook
     */
    ready: boolean;

    system: { version: string };

    scenes: EmbeddedCollection<Scene> & {
        active: Scene;
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

interface Scene {
    tokens: EmbeddedCollection<TokenDocumentPF>;
}
