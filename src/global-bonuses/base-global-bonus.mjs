import { MODULE_NAME } from '../consts.mjs';
import { localize } from '../util/localize.mjs';
import { GlobalBonusSettings } from '../util/settings.mjs';

/** @abstract */
export class BaseGlobalBonus {
    /**
     * Initialze any extra roll data specific to this bonus
     *
     * @abstract
     * @param {ItemAction} action
     * @param {RollData} rollData
     */
    static initRollData(action, rollData) { }

    /**
     * Label for this bonus.
     *
     * @returns {string}
     */
    static get label() { return localize(`global-bonus.${this.key}`); }

    /**
     * Key for this global bonus
     *
     * @abstract
     * @returns {string}
    */
    static get key() { throw new Error('Must be overridden'); }
    /** @returns {string} */
    static get actorDisabledFlag() { return `global-disabled.${this.key}`; }

    /**
     * Journal UUID
     *
     * @abstract
     * @returns {string}
    */
    static get journal() { throw new Error('Must be overridden'); }

    /**
     * Whether or not this bonus is disabled. Includes actor for cases when checking if it's disabled for a particular actor.
     *
     * @returns {boolean}
     */
    static isDisabled() {
        return !GlobalBonusSettings.setting(this.key);
    }

    /**
     * Whether or not this bonus is disabled. Includes actor for cases when checking if it's disabled for a particular actor.
     *
     * @param {ActorBasePF} actor
     * @returns {boolean}
     */
    static isDisabledForActor(actor) {
        if (!(actor instanceof pf1.documents.actor.ActorBasePF)) {
            return true;
        }
        return !!actor.getFlag(MODULE_NAME, this.actorDisabledFlag);
    }
}
