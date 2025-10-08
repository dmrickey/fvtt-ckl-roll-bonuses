import { showEnabledLabel } from '../../../handlebars-handlers/enabled-label.mjs';
import { localizeFluentDescription } from '../../../util/localize.mjs';
import { BaseConditionalTarget } from './_base-conditional.target.mjs';

/**
 * @extends BaseConditionalTarget
 */
export class AllTarget extends BaseConditionalTarget {

    /**
     * @override
     * @inheritdoc
     * @returns {string}
     */
    static get sourceKey() { return 'all'; }

    /**
     * @override
     * @inheritdoc
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#all'; }

    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static fluentDescription() { return localizeFluentDescription(this); }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} _source
     * @returns {Nullable<string[]>}
     */
    static getHints(_source) {
        return [this.label];
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

    /**
     * @inheritdoc
     * @override
     * @param {ActorPF} _actor
     * @param {ItemPF[]} sources
     * @returns {ItemPF[]}
     */
    static _filterToApplicableSources(_actor, sources) {
        return sources;
    };
}
