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
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#agile'; }

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
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        showEnabledLabel({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
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
     * @param {number} index
     */
    static itemActionRollDamage(_source, seed, _action, data, index) {
        // if this isn't the first part of the attack roll, then return
        if (index) {
            return;
        }

        const dexRegex = new RegExp(`[\\+-]\\s*[0-9]+\\[${pf1.config.abilities.dex}\\]`);
        const strRegex = new RegExp(`[\\+-]\\s*[0-9]+\\[${pf1.config.abilities.str}\\]`);

        const dexIsGreater = data.abilities.dex.mod > data.abilities.str.mod;
        const dexFormula = `+ ${data.abilities.dex.mod}[${pf1.config.abilities.dex}]`;

        const dexMatch = seed.formula.match(dexRegex);
        const strMatch = seed.formula.match(strRegex);

        if (strMatch && !dexMatch && dexIsGreater) {
            seed.formula = seed.formula.replace(strRegex, dexFormula);
        }
        else if (!dexMatch && dexIsGreater) {
            seed.formula = `${seed.formula} ${dexFormula}`;
        }
    }
}
