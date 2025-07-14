import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../../util/localize.mjs';
import { BaseTarget } from './_base-target.mjs';

export class FinesseTarget extends BaseTarget {
    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'finesse'; }

    /**
     * @override
     * @inheritdoc
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.iurMG1TBoX3auh5z#finesse'; }

    /**
     * @override
     * @inheritdoc
     * @returns { string }
     */
    static get tooltip() { return localizeBonusTooltip('finesse-target'); }

    /**
     * @override
     * @inheritdoc
     * @returns {string}
     */
    static get label() { return localizeBonusLabel('finesse-target'); }

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
     * @override
     * @inheritdoc
     * @param {object} options
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
            inputType: 'target',
        });
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF & {actor: ActorPF}} item
     * @param {ItemPF[]} sources
     * @returns {Nullable<ItemPF[]>}
     */
    static _getSourcesFor(item, sources) {
        const isNatural = !!item.system.weaponGroups?.total?.has('natural') || item.system.subType === 'natural';
        const isFinesse = !!item.system.properties?.fin;
        const ability = item.defaultAction?.ability.attack ?? '';

        if (ability === 'str' && (isNatural || isFinesse)) {
            return sources;
        }
    };
}
