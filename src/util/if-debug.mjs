import { MODULE_NAME } from '../consts.mjs';
import { registerSetting } from './settings.mjs';

const key = 'debug';

const debugSetup = () => registerSetting({ key, settingType: Boolean }, { skipReady: true });

/**
 *
 * @param {() => void} func
 * @returns
 */
const ifDebug = (func) => {
    const isDebug = game.settings?.settings.has(`${MODULE_NAME}.${key}`) && game.settings.get(MODULE_NAME, key);
    if (isDebug) {
        func();
    }
};

export { ifDebug, debugSetup };
