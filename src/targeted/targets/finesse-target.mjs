import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../../util/localize.mjs';
import { BaseTarget } from './base-target.mjs';

export class FinesseTarget extends BaseTarget {

    static finesseTargetOverride = 'finesse-override';

    /**
     * @override
     */
    static get sourceKey() { return 'finesse'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.iurMG1TBoX3auh5z#finesse'; }

    /** @override @returns { string } */
    static get tooltip() { return localizeBonusTooltip('finesse-target'); }

    /** @override @returns {string} */
    static get label() { return localizeBonusLabel('finesse-target'); }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
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
        const isWeapon = item instanceof pf1.documents.item.ItemWeaponPF;
        const isAttack = item instanceof pf1.documents.item.ItemAttackPF;

        if (!isWeapon && !isAttack) {
            return [];
        }

        if (item.system.weaponGroups?.value.includes('natural')
            || item.hasItemBooleanFlag(this.finesseTargetOverride)
            || (isWeapon && item.system.properties.fin)
        ) {
            return sources;
        }
    };
}
