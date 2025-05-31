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
        /** @deprecated Do not use, base everything on the token or user's scene */
        current: Scene;
        viewed: Scene;
    };

    /**
     * Client settings which are used to configure application behavior
     */
    settings: ClientSettings;

    time: { worldTime: number };

    user: User;
    users: {
        activeGM: user & { isGM: true };
        players: Array<User & { isGM: false }>;
    } & EmbeddedCollection<User>;
    userId: string;
}

interface Pack<T extends Document = Document> {
    documentName: string;
    locked: boolean;

    getDocuments(): Promise<EmbeddedCollection<Document>>;
    updateAll(func: (Document) => void): Promise<void>;
}
