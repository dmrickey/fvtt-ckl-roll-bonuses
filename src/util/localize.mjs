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
const localizeGenericBonusHint = (key, opts = {}) => localize(`generic-bonus.hint.${key}`, opts);

/**
 * @param {string} key
 * @param {Record<string, unknown>} [opts]
 * @returns {string}
 */
const localizeGenericBonusLabel = (key, opts = {}) => localize(`generic-bonus.label.${key}`, opts);

/**
 * @param {string} key
 * @param {Record<string, unknown>} [opts]
 * @returns {string}
 */
const localizeTargetedBonusHint = (key, opts = {}) => localize(`bonus-target.bonus.hint.${key}`, opts);

/**
 * @param {string} key
 * @param {Record<string, unknown>} [opts]
 * @returns {string}
 */
const localizeTargetedBonusLabel = (key, opts = {}) => localize(`bonus-target.bonus.label.${key}`, opts);

/**
 * @param {string} key
 * @param {Record<string, unknown>} [opts]
 * @returns {string}
 */
const localizeTargetedTargetHint = (key, opts = {}) => localize(`bonus-target.target.hint.${key}`, opts);

/**
 * @param {string} key
 * @param {Record<string, unknown>} [opts]
 * @returns {string}
 */
const localizeTargetedTargetLabel = (key, opts = {}) => localize(`bonus-target.target.label.${key}`, opts);

export {
    localizeGenericBonusHint,
    localizeGenericBonusLabel,
    localizeTargetedBonusHint,
    localizeTargetedBonusLabel,
    localizeTargetedTargetHint,
    localizeTargetedTargetLabel,
    localize,
};
