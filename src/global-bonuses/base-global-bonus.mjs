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
    static get label() { return localize(`global-bonus.label.${this.bonusKey}`); }

    static get attackLabel() { return this._attackLabel(this.bonusKey) }
    /**
     * Fetches chat attack label for thie given key
     *
     * @param {string} key
     * @param {Record<string, unknown>} [opts]
     * @returns {string}
     */
    static _attackLabel(key, opts = {}) { return localize(`global-bonus.attack-label.${key}`, opts); }

    static get warning() { return this._warning(this.bonusKey) }
    /**
     * Fetches UI warning for thie given key
     *
     * @param {string} key
     * @param {Record<string, unknown>} [opts]
     * @returns {string}
     */
    static _warning(key, opts = {}) { return localize(`global-bonus.warning.${key}`, opts); }

    /** @returns { string } */
    static get key() { return `global-bonus_${this.bonusKey}`; }

    /** @returns { string } */
    static get dialogDisableKey() { return `global-bonus.dialog-disable.${this.bonusKey}`; }

    /** @returns { ParsedContextNoteEntry } */
    static get disabledFootnote() { return { text: localize(`global-bonus.disabled-footnote.${this.bonusKey}`) }; }

    /**
     * Key for this global bonus
     *
     * @abstract
     * @returns {string}
    */
    static get bonusKey() { throw new Error('Must be overridden'); }
    /** @returns {string} */
    static get actorDisabledFlag() { return `global-disabled.${this.key}`; }

    /**
     * Register any specific or targeted bonuses that are associated with this global bonus
     *
     * @abstract
     */
    static registerBonuses() { }

    /**
     * Journal UUID
     *
     * @abstract
     * @returns {string}
    */
    static get journal() { throw new Error('Must be overridden'); }

    /**
     * Whether or not this bonus is disabled.
     *
     * @returns {boolean}
     */
    static isDisabled() {
        return !GlobalBonusSettings.setting(this.key);
    }

    /**
     * Whether or not this bonus is disabled for a particular actor.
     *
     * @param {Nullable<ActorBasePF>} actor
     * @returns {boolean}
     */
    static isDisabledForActor(actor) {
        return !(actor instanceof pf1.documents.actor.ActorBasePF)
            || !!actor.getFlag(MODULE_NAME, this.actorDisabledFlag);
    }
}
