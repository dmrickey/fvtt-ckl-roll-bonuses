import { MODULE_NAME } from "../consts.mjs";
import { localize } from "./localize.mjs";

/**
 *
 * @param {object} setting
 * @param {boolean} [setting.config]
 * @param {string} setting.key
 * @param {any} [setting.defaultValue]
 * @param {'world' | 'client'} [setting.scope]
 * @param {BooleanConstructor | StringConstructor | NumberConstructor} [setting.settingType]
 * @param {object} [options]
 * @param {boolean} [options.skipReady]
 */
export const registerSetting = ({
    config = true,
    defaultValue = null,
    key,
    scope = 'world',
    settingType = String,
}, {
    skipReady = false
} = {}) => {
    const doIt = () =>
        game.settings.register(MODULE_NAME, key, {
            name: `${MODULE_NAME}.settings.${key}.name`,
            hint: `${MODULE_NAME}.settings.${key}.hint`,
            default: defaultValue == null ? localize(`settings.${key}.default`) : defaultValue,
            scope,
            requiresReload: false,
            config,
            type: settingType
        });

    game.ready || skipReady
        ? doIt()
        : Hooks.once('ready', doIt);
};
