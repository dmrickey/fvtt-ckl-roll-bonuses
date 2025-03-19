import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { localize } from '../../util/localize.mjs';
import { BaseBonus } from './_base-bonus.mjs';

/** @extends {BaseBonus} */
export class MaximizeDamageBonus extends BaseBonus {

    /**
     * @override
     * @returns { string }
     */
    static get sourceKey() { return 'maximize-damage'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#maximize-damage'; }

    /**
     * @override
     * @param {ItemPF} source The source of the bonus
     * @param {(ActionUse | ItemPF | ItemAction)?} [_thing] The thing receiving the bonus for contextually aware hints.
     * @returns {ParsedContextNoteEntry[]}
     */
    static getFootnotes(source, _thing) { return [{ text: localize('maximized'), source: source.name }]; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} _source The source of the bonus
     * @param {(ActionUse | ItemPF | ItemAction)?} [target] The target for contextually aware hints
     * @returns {Nullable<string[]>}
     */
    static getHints(_source, target = undefined) {
        if (!target) return [this.label];

        const action = target instanceof pf1.components.ItemAction
            ? target
            : target instanceof pf1.actionUse.ActionUse
                ? target.action
                : target.defaultAction;

        if (!action) return;

        /** @param {'parts' | 'nonCritParts'} path */
        const getFormula = (path) => action.damage[path].flatMap(x => x.formula);
        const damage = [...getFormula('parts'), ...getFormula('nonCritParts')];
        const formula = damage.join(' + ');
        if (!formula) return;
        const total = RollPF.create(formula, action.getRollData()).evaluateSync({ maximize: true }).total;
        if (total) {
            return [localize('maximized-total', { total })];
        }
    }

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
        seed.options.maximize = true;
    }

    /**
     * @override
     * @param {object} options
     * @param {ActorPF | null} options.actor
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, item, isEditable }) {
        showEnabledLabel({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
        }, {
            canEdit: isEditable,
            inputType: 'bonus',
        });
    }
}
