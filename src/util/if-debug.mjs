import { api } from './api.mjs';
import { MODULE_NAME } from '../consts.mjs';
import { registerSetting } from './settings.mjs';

const key = 'debug';

Hooks.once('setup', () => registerSetting({ key, settingType: Boolean, defaultValue: false }, { skipReady: true }));

/**
 * @param {() => void} func
 * @returns
 */
const ifDebug = (func) => {
    const isDebug = game.settings?.settings.has(`${MODULE_NAME}.${key}`) && game.settings.get(MODULE_NAME, key);
    if (isDebug) {
        func();
    }
};

export { ifDebug };

api.utils.ifDebug = ifDebug;
