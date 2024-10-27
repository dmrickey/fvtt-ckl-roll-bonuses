
import { MODULE_NAME } from '../../consts.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../../util/localize.mjs';
import { BaseBonus } from './base-bonus.mjs';

export class ScriptCallBonus extends BaseBonus {

    /**
     * @override
     * @returns { string }
     */
    static get sourceKey() { return 'script-call'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#script-call'; }

    /**
     * Get Item Hints tooltip value
     *
     * @override
     * @param {ItemPF} source The source of the bonus
     * @param {(ActionUse | ItemPF | ItemAction)?} [target] The target for contextually aware hints
     * @returns {Nullable<string[]>}
     */
    static getHints(source, target = undefined) {
        // TODO - show what type of script call this is.
        return [this.label];
    }

    /**
     * @override
     * @param {ItemPF} item
     * @param {RollData} rollData
     */
    static prepareSourceData(item, rollData) {
        // TOOD - try it without this, if it doesn't work then try again with whatever `_prepareScriptCall` is doing
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
        // TOOD
    }
}
