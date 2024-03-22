import { MODULE_NAME } from '../../consts.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { LocalHookHandler, localHooks } from '../../util/hooks.mjs';
import { BaseBonus } from './base-bonus.mjs';

export class WeaponFinesseBonus extends BaseBonus {

    /**
     * @override
     * @returns { string }
     */
    static get type() { return 'weapon-finesse'; }

    /**
     * Get Item Hints tooltip value
     *
     * @override
     * @param {ItemPF} source The source of the bonus
     * @param {(ActionUse | ItemPF | ItemAction)?} [target] The target for contextually aware hints
     * @returns {Nullable<string[]>}
     */
    static getHints(source, target = undefined) {
        if (this.isBonusSource(source)) {
            return [this.label];
        }
    }

    /**
     * @override
     * @param {ItemPF} _source
     * @param {ItemAction} _action
     * @param {RollData} rollData
     */
    static updateItemActionRollData(_source, _action, rollData) {
        // if (rollData.action?.ability.attack === 'str'
        //     && rollData.abilities.str.mod < rollData.abilities.dex.mod
        // ) {
        //     rollData[MODULE_NAME][this.key] = { mod: rollData.abilities.dex.mod };
        // }
    }

    /**
     * @override
     * @param {object} options
     * @param {ActorPF | null} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ actor, item, html }) {
        showEnabledLabel({
            label: this.label,
            parent: html,
        });
    }

    /**
     * @override
     * @param {ItemPF} source The source of the bonus
     * @param {(ActionUse | ItemPF | ItemAction)?} [item] The item receiving the bonus for contextually aware hints.
     * @returns {string[]}
     */
    static getFootnotes(source, item) { return [this.label]; }

    /**
     * @override
     * @param {ItemPF} _source
     * @param {ItemActionRollAttackHookArgs} seed
     * @param {ItemAction} _action
     * @param {RollData} data
     * @returns {ItemActionRollAttackHookArgs}
     */
    static itemActionRollAttack(_source, seed, _action, data) {
        const strRegex = new RegExp(`[0-9]+\\[${pf1.config.abilities.str}\\]`);
        if (data && seed.formula.match(strRegex)) {
            seed.formula = seed.formula.replace(strRegex, `${data.abilities.dex.mod}[${pf1.config.abilities.dex}]`);
        }
        return seed;
    }
}
