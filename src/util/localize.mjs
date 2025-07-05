import { MODULE_NAME } from "../consts.mjs";
import { BaseConditionalTarget } from '../targeted/targets/conditional/_base-conditional.target.mjs';
import { api } from './api.mjs';
import { ifDebug } from './if-debug.mjs';
import { isEmptyObject } from "./is-empty-object.mjs";

/**
 * Looks up a localized string. Outputs a warning if there is no corresponding key.
 *
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
        if (str === key && key.includes('.')) {
            const message = `${MODULE_NAME} - Missing translation for ${key}`;
            ui.notifications.error(message);
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
 * @param {string | typeof BaseConditionalTarget} target
 * @param {Record<string, unknown>} [opts]
 * @returns {string}
 */
const localizeFluentDescription = (target, opts = {}) => {
    let key = typeof target === 'string' ? target : target.key;
    const split = key.split('_');
    key = split[1] || split[0];
    return localize(`fluent-description.${key}`, opts);
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
    localizeFluentDescription,
    localizeItemHint,
};

api.utils.localize = localize;
