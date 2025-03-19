import { MODULE_NAME } from '../../consts.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { BaseBonus } from './_base-bonus.mjs';

export class AgileBonus extends BaseBonus {

    /**
     * @override
     * @inheritdoc
     * @returns { string }
     */
    static get sourceKey() { return 'agile'; }

    /**
     * @override
     * @inheritdoc
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#agile'; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} _source The source of the bonus
     * @param {(ActionUse | ItemPF | ItemAction)?} [_target] The target for contextually aware hints
     * @returns {Nullable<string[]>}
     */
    static getHints(_source, _target = undefined) {
        return [this.label];
    }

    /**
     * @override
     * @inheritdoc
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
                    type: 'untypedPerm',
                    operator: 'add',
                    priority: 0,
                    target: 'damage',
                    value: dex,
                });
                sources.push(change);
            }
            if (str) {
                const change = new pf1.components.ItemChange({
                    flavor: source.name,
                    formula: -str,
                    type: 'untypedPerm',
                    operator: 'add',
                    priority: 0,
                    target: 'damage',
                    value: -str,
                });
                sources.push(change);
            }
        }

        return sources;
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} item
     * @param {RollData} rollData
     */
    static prepareSourceData(item, rollData) {
        item[MODULE_NAME][this.key] = {
            dex: rollData.abilities.dex.mod,
            str: rollData.abilities.str.mod,
        };
    }

    /**
     * @override
     * @inheritdoc
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
            inputType: 'bonus',
        });
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source The source of the bonus
     * @param {(ActionUse | ItemPF | ItemAction)?} [_item] The item receiving the bonus for contextually aware hints.
     * @returns {ParsedContextNoteEntry[]}
     */
    static getFootnotes(source, _item) { return [{ text: this.label, source: source.name }]; }

    /**
     * @override
     * @inheritdoc
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
