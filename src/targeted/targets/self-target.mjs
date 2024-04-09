import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { BaseTarget } from './base-target.mjs';

export class SelfTarget extends BaseTarget {

    /**
     * @override
     */
    static get sourceKey() { return 'self'; }

    /**
     * @override
     * @inheritdoc
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.iurMG1TBoX3auh5z#self'; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        return [this.label];
    }

    /**
     * @override
     * @inheritdoc
     */
    static get isGenericTarget() { return true; }

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
        });
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF | ActionUse | ItemAction} doc
     * @returns {ItemPF[]}
     */
    static getSourcesFor(doc) {
        const item = doc instanceof pf1.documents.item.ItemPF
            ? doc
            : doc.item;
        return item.hasItemBooleanFlag(this.key)
            ? [item]
            : [];
    };
}
