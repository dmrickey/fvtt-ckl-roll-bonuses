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

        if (!item?.actor) {
            return [];
        }

        const isWeapon = item instanceof pf1.documents.item.ItemWeaponPF;
        const isAttack = item instanceof pf1.documents.item.ItemAttackPF;

        if (!isWeapon && !isAttack) {
            return [];
        }

        if (isWeapon
            && !(item.system.properties.fin
                || item.system.weaponGroups.value.includes('natural')
            )
        ) {
            return [];
        }

        if (isAttack
            && !(!!item.system.flags.boolean[this.finesseTargetOverride]
                || item.system.weaponGroups?.value.includes('natural')
            )
        ) {
            return [];
        }

        const flaggedItems = item.actor.itemFlags?.boolean[this.key]?.sources ?? [];
        return flaggedItems;
    };
}
