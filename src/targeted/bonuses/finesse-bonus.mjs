
import { MODULE_NAME } from '../../consts.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../../util/localize.mjs';
import { BaseBonus } from './_base-bonus.mjs';

export class FinesseBonus extends BaseBonus {

    /**
     * @override
     * @returns { string }
     */
    static get sourceKey() { return 'finesse'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#finesse'; }

    /** @override @returns { string } */
    static get tooltip() { return localizeBonusTooltip('finesse-bonus'); }

    /** @override @returns {string} */
    static get label() { return localizeBonusLabel('finesse-bonus'); }

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
     * @override
     * @param {ItemPF} source
     * @returns {ModifierSource[]}
     */
    static getAttackSourcesForTooltip(source) {
        const /** @type {ModifierSource[]} */ sources = [];

        const { dex, str } = source[MODULE_NAME]?.[this.key];
        if (dex || str) {

            if (dex) {
                sources.push({
                    value: dex,
                    name: source.name,
                    modifier: 'untyped',
                    sort: -100,
                });
            }
            if (str) {
                sources.push({
                    value: -str,
                    name: source.name,
                    modifier: 'untyped',
                    sort: -100,
                });
            }
        }

        return sources;
    }

    /**
     * @override
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
            label: this.label,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'bonus',
        });
    }

    /**
     * @override
     * @param {ItemPF} source The source of the bonus
     * @param {(ActionUse | ItemPF | ItemAction)?} [_thing] The thing receiving the bonus for contextually aware hints.
     * @returns {ParsedContextNoteEntry[]}
     */
    static getFootnotes(source, _thing) { return [{ text: this.label, source: source.name }]; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} _source
     * @param {ItemActionRollAttackHookArgs} seed
     * @param {ItemAction} _action
     * @param {RollData} data
     */
    static itemActionRollAttack(_source, seed, _action, data) {
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
