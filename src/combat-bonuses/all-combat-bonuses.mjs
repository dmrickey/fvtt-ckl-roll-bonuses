import { LocalHookHandler, localHooks } from '../util/hooks.mjs';
import * as rangedPenalty from './ranged-attack-penalty.mjs';

/**
 * @param { ItemAction} action
 * @param {RollData} rollData
 */
function initRollData(action, rollData) {
    rangedPenalty.initRollData(action, rollData);
}
LocalHookHandler.registerHandler(localHooks.initItemActionRollData, initRollData);
