export { }

import './core/hooks'

declare global {
    /**
     * The singleton Game instance
     * @defaultValue `{}`
     * @remarks
     * Initialized between the `"DOMContentLoaded"` event and the `"init"` hook event.
     */
    let game: "game" extends keyof LenientGlobalVariableTypes ? Game : Game | {};

    let CONFIG: CONFIG;

    let Hooks: Hooks;
}
