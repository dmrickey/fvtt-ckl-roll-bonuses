import { MODULE_NAME } from "../consts.mjs";
import { ifDebug } from './if-debug.mjs';
import { isEmptyObject } from "./is-empty-object.mjs";

/**
 * @param {string} key
 * @param {Record<string, unknown>} [opts]
 * @returns
 */
const localize = (key, opts = {}) => {
    const myKey = `${MODULE_NAME}.${key}`;
    let str = isEmptyObject(opts)
        ? (game.i18n.localize(myKey) === myKey ? game.i18n.localize(key) : game.i18n.localize(myKey))
        : (game.i18n.format(myKey, opts) === myKey ? game.i18n.format(key, opts) : game.i18n.format(myKey, opts));

    ifDebug(() => {
        if (str === key) {
            console.error(`${MODULE_NAME} - Missing translation for ${key}`);
            str = `*** ${str} ***`;
        }
    });

    return str;
}

/**
 * @param {string} key
 * @param {Record<string, unknown>} [opts]
 * @returns {string}
 */
const localizeBonusLabel = (key, opts = {}) => {
    const split = key.split('_');
    key = split[1] || split[0];
    return localize(`bonuses.label.${key}`, opts);
};

/**
 * @param {string} key
 * @param {Record<string, unknown>} [opts]
 * @returns {string}
 */
const localizeBonusTooltip = (key, opts = {}) => {
    const split = key.split('_');
    key = split[1] || split[0];
    return localize(`bonuses.tooltip.${key}`, opts);
};

/**
 * @param {string} key
 * @param {Record<string, unknown>} [opts]
 * @returns {string}
 */
const localizeItemHint = (key, opts = {}) => {
    const split = key.split('_');
    key = split[1] || split[0];
    return localize(`item-hints.${key}`, opts);
};

export {
    localize,
    localizeBonusLabel,
    localizeBonusTooltip,
    localizeItemHint,
};
