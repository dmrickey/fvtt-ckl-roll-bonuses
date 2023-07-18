import { MODULE_NAME } from "../consts.mjs";
import { isEmptyObject } from "./is-empty-object.mjs";

const localize = (/** @type {string} */key, opts = {}) => {
    const myKey = `${MODULE_NAME}.${key}`;
    return isEmptyObject(opts)
        ? (game.i18n.localize(myKey) === myKey ? game.i18n.localize(key) : game.i18n.localize(myKey))
        : (game.i18n.format(myKey, opts) === myKey ? game.i18n.format(key, opts) : game.i18n.format(myKey, opts));
}

export { localize };
