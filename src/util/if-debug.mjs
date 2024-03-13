import { MODULE_NAME } from '../consts.mjs';
import { registerSetting } from './settings.mjs';

/**
 *
 * @param {() => void} func
 * @returns
 */
const ifDebug = (func) => {
    if (game.settings?.get(MODULE_NAME, 'debug')) {
        func();
    }
};

export { ifDebug };
