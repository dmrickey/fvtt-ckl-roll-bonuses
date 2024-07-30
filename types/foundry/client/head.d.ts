export {};

import './core/hooks';

declare global {
    /**
     * The singleton Game instance
     * @defaultValue `{}`
     * @remarks
     * Initialized between the `"DOMContentLoaded"` event and the `"init"` hook event.
     */
    let game: 'game' extends keyof LenientGlobalVariableTypes
        ? Game
        : Game | {};

    let ui: ui;

    let CONFIG: CONFIG;

    let CONST: CONST;

    let Hooks: Hooks;

    let foundry: {
        utils: {
            objectsEqual<T>(a: T, b: T): boolean;
            expandObject(_: object, depth?: number): Record<string, unknown>;
            randomID(): string;
            /**
             *
             * @param {string} v0
             * @param {string} v1
             * @returns True if v0 is newer than v1
             */
            isNewerVersion(v0: string, v1: string): boolean;
        };
    };
}

interface ui {
    notifications: {
        error(string): void;
        warn(string): void;
    };
}
