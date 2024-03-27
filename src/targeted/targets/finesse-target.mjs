import { MODULE_NAME } from '../../consts.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { BaseTarget } from './base-target.mjs';

export class FinesseTarget extends BaseTarget {

    static finesseTargetOverride = 'finesse-override';

    /**
     * @override
     */
    static get sourceKey() { return 'finesse'; }

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
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, item }) {
        showEnabledLabel({
            item,
            label: this.label,
            parent: html,
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

        const flaggedItems = item.actor.itemFlags.boolean[this.key]?.sources ?? [];
        return flaggedItems;
    };
}
