/**
 * Runtime configuration settings for Foundry VTT which exposes a large number of variables which determine how
 * aspects of the software behaves.
 *
 * Unlike the CONST analog which is frozen and immutable, the CONFIG object may be updated during the course of a
 * session or modified by system and module developers to adjust how the application behaves.
 */
interface CONFIG {
    /**
     * Configure debugging flags to display additional information
     */
    debug: {
        /** @defaultValue `false` */
        dice: boolean;

        /** @defaultValue `false` */
        documents: boolean;

        /** @defaultValue `false` */
        fog: boolean;

        /** @defaultValue `false` */
        hooks: boolean;

        /** @defaultValue `false` */
        av: boolean;

        /** @defaultValue `false` */
        avclient: boolean;

        /** @defaultValue `false` */
        mouseInteraction: boolean;

        /** @defaultValue `false` */
        time: boolean;

        /** @defaultValue `false` */
        keybindings: boolean;

        /** @defaultValue `false` */
        polygons: boolean;

        /** @defaultValue `false` */
        gamepad: boolean;
    };

    /**
     * Configuration for the Combat document
     */
    Combat: {
        /** @defaultValue `Combat` */
        documentClass: ConfiguredDocumentClassOrDefault<typeof Combat>;

        /** @defaultValue `CombatEncounters` */
        collection: ConstructorOf<CombatEncounters>;

        /** @defaultValue `"fas fa-swords"` */
        sidebarIcon: string;

        initiative: {
            /** @defaultValue `null` */
            formula: string | null;

            /** @defaultValue `2` */
            decimals: number;
        };
    }
}

type ConfiguredDocumentClassOrDefault<Fallback extends DocumentConstructor> =
    Fallback["metadata"]["name"] extends keyof DocumentClassConfig
    ? DocumentClassConfig[Fallback["metadata"]["name"]]
    : Fallback;
