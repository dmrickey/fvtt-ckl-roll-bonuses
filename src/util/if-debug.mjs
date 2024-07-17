import { api } from './api.mjs';
import { MODULE_NAME } from '../consts.mjs';
import { registerSetting } from './settings.mjs';

const key = 'debug';

registerSetting({ key, settingType: Boolean, defaultValue: false });

/**
 * Executes the passed in function if the module's debug option is enabled. Most useful for logging `ifDebug(() => console.log('some message'));`. This way the source of the log is accurate in the debug console vs having a generic log function.
 * @param {() => void} func
 */
const ifDebug = (func) => {
    const isDebug = game.settings?.settings.has(`${MODULE_NAME}.${key}`) && game.settings.get(MODULE_NAME, key);
    if (isDebug) {
        func();
    }
};

export { ifDebug };

api.utils.ifDebug = ifDebug;
