import { showEnabledLabel } from '../../../handlebars-handlers/enabled-label.mjs';
import { isActorInCombat } from '../../../util/is-actor-in-combat.mjs';
import { localizeFluentDescription } from '../../../util/localize.mjs';
import { BaseConditionalTarget } from './_base-conditional.target.mjs';

/** @extends {BaseConditionalTarget} */
export class WhenInCombatTarget extends BaseConditionalTarget {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'when-in-combat'; }

    /**
     * @override
     * @inheritdoc
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#when-in-combat'; }

    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static fluentDescription() {
        return localizeFluentDescription(this);
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} _source
     * @returns {Nullable<string[]>}
     */
    static getHints(_source) {
        return [this.label];
    }

    /**
     * @inheritdoc
     * @override
     * @param {ActorPF} actor
     * @param {ItemPF[]} sources
     * @returns {ItemPF[]}
     */
    static _filterToApplicableSources(actor, sources) {
        if (!isActorInCombat(actor)) {
            return [];
        }

        return sources;
    }

    /**
     * @inheritdoc
     * @override
     * @param {object} options
     * @param {ActorPF | null | undefined} options.actor
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
            inputType: 'target',
        });
    }
}
