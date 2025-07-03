import { api } from './api.mjs';
import { truthiness } from "./truthiness.mjs";

/**
 * @type {ItemHintsAPI}
 */
let itemHintsAPI;

/**
 * @type {hintFunc[]}
 */
const funcs = [];

/**
 * @param {Nullable<ActorPF>} actor
 * @param {ItemPF} item
 * @param {ItemHintData} data
 * @returns {Hint[]}
 */
function itemHintsHandler(actor, item, data) {
    const hintcls = itemHintsAPI.HintClass;
    const hints = funcs
        .map((func) => func(hintcls, actor, item, data))
        .flatMap((hint) => hint)
        .filter(truthiness);
    return hints;
}

function itemHintsRegistration() {
    const itemHintsModule = game.modules.get('mkah-pf1-item-hints');
    if (itemHintsModule?.active) {
        itemHintsAPI = itemHintsModule.api;
        itemHintsAPI.addHandler(itemHintsHandler);
    }
}

Hooks.once('ready', itemHintsRegistration);

/**
 * @param {hintFunc} func
 */
export const registerItemHint = (func) => funcs.push(func);
api.utils.registerItemHint = registerItemHint;
