import { intersects } from "../util/array-intersects.mjs";
import { truthiness } from "../util/truthiness.mjs";
import { BaseAttackTarget } from "./base-target.mjs";

export class WeaponGroupTarget extends BaseAttackTarget {
    /** @type {TraitSelector} */
    weaponGroups = { custom: '', value: [] };
    get #weaponGroupsArray() { return [...this.weaponGroups.value, ...this.weaponGroups.custom.split(';')].map(x => x.trim()).filter(truthiness); }

    /**
     * @inheritdoc
     * @override
     * @returns {'weapon-group'}
     */
    get type() { return 'weapon-group'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF | ActionUse} item
     * @returns {boolean}
     */
    isTarget(item) {
        if (!(item instanceof pf1.documents.item.ItemAttackPF
            || item instanceof pf1.documents.item.ItemWeaponPF)
        ) {
            return false;
        }
        if (!item.system.weaponGroups) {
            return false;
        }

        const weaponGroups = [...item.system.weaponGroups.value, ...item.system.weaponGroups.custom.split(';')]
            .map(x => x.trim())
            .filter(truthiness);
        return intersects(weaponGroups, this.#weaponGroupsArray);
    }
}
