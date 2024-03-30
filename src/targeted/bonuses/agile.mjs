import { MODULE_NAME } from '../../consts.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { BaseBonus } from './base-bonus.mjs';

export class AgileBonus extends BaseBonus {

    /**
     * @override
     * @returns { string }
     */
    static get sourceKey() { return 'agile'; }

    /**
     * Get Item Hints tooltip value
     *
     * @override
     * @param {ItemPF} source The source of the bonus
     * @param {(ActionUse | ItemPF | ItemAction)?} [target] The target for contextually aware hints
     * @returns {Nullable<string[]>}
     */
    static getHints(source, target = undefined) {
        return [this.label];
    }

    /**
     * Add damage bonus to actor's Combat damage column tooltip
     *
     * @override
     * @param {ItemPF} source
     * @returns {ItemChange[]}
     */
    static getDamageSourcesForTooltip(source) {
        /** @type {ItemChange[]} */
        const sources = [];

        const { dex, str } = source[MODULE_NAME]?.[this.key];
        if (dex || str) {

            if (dex) {
                const change = new pf1.components.ItemChange({
                    flavor: source.name,
                    formula: dex,
                    modifier: 'untypedPerm',
                    operator: 'add',
                    priority: 0,
                    subTarget: 'damage',
                    value: dex,
                });
                sources.push(change);
            }
            if (str) {
                const change = new pf1.components.ItemChange({
                    flavor: source.name,
                    formula: -str,
                    modifier: 'untypedPerm',
                    operator: 'add',
                    priority: 0,
                    subTarget: 'damage',
                    value: -str,
                });
                sources.push(change);
            }
        }

        return sources;
    }

    /**
     * @override
     * @param {ItemPF} item
     * @param {RollData} rollData
     */
    static prepareData(item, rollData) {
        item[MODULE_NAME][this.key] = {
            dex: rollData.abilities.dex.mod,
            str: rollData.abilities.str.mod,
        };
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
            item,
            key: this.key,
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
    static itemActionRollDamage(_source, seed, _action, data) {
        const strRegex = new RegExp(`[\\+-]\\s*[0-9]+\\[${pf1.config.abilities.str}\\]`);
        const dexIsGreater = data.abilities.dex.mod > data.abilities.str.mod;
        const dexFormula = `+ ${data.abilities.dex.mod}[${pf1.config.abilities.dex}]`;
        if (seed.formula.match(strRegex) && dexIsGreater) {
            seed.formula = seed.formula.replace(strRegex, dexFormula);
        }
        else if (dexIsGreater) {
            seed.formula = `${seed.formula} ${dexFormula}`;
        }
        return seed;
    }
}
