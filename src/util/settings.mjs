import { MODULE_NAME } from "../consts.mjs";
import { localize } from "./localize.mjs";

/**
 *
 * @param {object} setting
 * @param {string} setting.key
 * @param {any} [setting.defaultValue]
 * @param {'world' | 'client'} [setting.scope]
 * @param {BooleanConstructor | StringConstructor} [setting.settingType]
 * @param {object} options
 * @param {boolean} [options.registerNow]
 */
export const registerSetting = ({
    key,
    defaultValue = null,
    scope = 'world',
    settingType = String,
}, {
    registerNow = false,
} = {}) => {
    const doIt = () => {
        defaultValue ||= localize(`settings.${key}.default`);
        game.settings.register(MODULE_NAME, key, {
            name: `${MODULE_NAME}.settings.${key}.name`,
            hint: `${MODULE_NAME}.settings.${key}.hint`,
            default: defaultValue,
            scope,
            requiresReload: false,
            config: true,
            type: settingType
        })
    };

    game.ready || registerNow
        ? doIt()
        : Hooks.once('ready', () => doIt());
};
