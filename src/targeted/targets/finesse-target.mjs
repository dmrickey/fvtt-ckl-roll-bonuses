import { MODULE_NAME } from '../../consts.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { BaseTarget } from './base-target.mjs';

export class FinesseTarget extends BaseTarget {

    static finesseTargetOverride = 'finesse-override';

    /**
     * @override
     */
    static get targetKey() { return 'finesse'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        /** @type {string[]} */
        if (source.getFlag(MODULE_NAME, this.key)) {
            return [this.label];
        }
        return;
    }

    /**
     * @inheritdoc
     * @override
     * @param {object} options
     * @param {ActorPF | null | undefined} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ html }) {
        showEnabledLabel({
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

        if (item instanceof pf1.documents.item.ItemWeaponPF
            && !(item.system.properties.fin
                || item.system.weaponGroups.value.includes('natural')
            )
        ) {
            return [];
        }

        if (item instanceof pf1.documents.item.ItemAttackPF
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
