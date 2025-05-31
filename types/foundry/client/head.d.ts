export {};

import { Document } from '../common/abstract/document.mjs';
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

    let canvas: Canvas;

    let CONFIG: CONFIG;

    let CONST: CONST;

    let Hooks: Hooks;

    let foundry: {
        abstract: {
            TypeDataModel: any;
        };
        CONST: {
            GRID_TYPES: {
                GRIDLESS: number;
            };
        };
        utils: {
            /**
             * Log a compatibility warning which is filtered based on the client's defined compatibility settings.
             * @param {string} message            The original warning or error message
             * @param {object} [options={}]       Additional options which customize logging
             * @param {number} [options.mode]           A logging level in COMPATIBILITY_MODES which overrides the configured default
             * @param {number|string} [options.since]   A version identifier since which a change was made
             * @param {number|string} [options.until]   A version identifier until which a change remains supported
             * @param {string} [options.details]        Additional details to append to the logged message
             * @param {boolean} [options.stack=true]    Include the message stack trace
             * @param {boolean} [options.once=false]    Log this the message only once?
             * @throws                            An Error if the mode is ERROR
             */
            logCompatibilityWarning(
                message,
                { mode, since, until, details, stack = true, once = false } = {}
            );
            getProperty(rollData: object, path: string);
            /**
             * A helper function which searches through an object to assign a value using a string key
             * This string key supports the notation a.b.c which would target object[a][b][c]
             * @param object - The object to update
             * @param path   - The string key
             * @param value  - The value to be assigned
             * @returns Whether the value was changed from its previous value
             */
            setProperty(object: object, path: string, value: any): unknown;
            deepClone<T>(arg0: T): T;
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

    class JournalEntryPage extends Document {}
}

interface ui {
    notifications: {
        error(string): void;
        warn(string): void;
    };
}
