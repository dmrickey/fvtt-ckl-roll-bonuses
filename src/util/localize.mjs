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
const localizeSpecificBonusTooltip = (key, opts = {}) => localize(`specific-bonus.tooltip.${key}`, opts);

/**
 * @param {string} key
 * @param {Record<string, unknown>} [opts]
 * @returns {string}
 */
const localizeSpecificBonusLabel = (key, opts = {}) => localize(`specific-bonus.label.${key}`, opts);

/**
 * @param {string} key
 * @param {Record<string, unknown>} [opts]
 * @returns {string}
 */
const localizeTargetedBonusTooltip = (key, opts = {}) => localize(`source.bonus.tooltip.${key}`, opts);

/**
 * @param {string} key
 * @param {Record<string, unknown>} [opts]
 * @returns {string}
 */
const localizeTargetedBonusLabel = (key, opts = {}) => localize(`source.bonus.label.${key}`, opts);

/**
 * @param {string} key
 * @param {Record<string, unknown>} [opts]
 * @returns {string}
 */
const localizeTargetedTargetTooltip = (key, opts = {}) => localize(`source.target.tooltip.${key}`, opts);

/**
 * @param {string} key
 * @param {Record<string, unknown>} [opts]
 * @returns {string}
 */
const localizeTargetedTargetLabel = (key, opts = {}) => localize(`source.target.label.${key}`, opts);

export {
    localizeSpecificBonusTooltip,
    localizeSpecificBonusLabel,
    localizeTargetedBonusTooltip,
    localizeTargetedBonusLabel,
    localizeTargetedTargetTooltip,
    localizeTargetedTargetLabel,
    localize,
};
