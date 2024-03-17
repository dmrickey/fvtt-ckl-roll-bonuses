// @ts-nocheck
import { intersects } from "../../../util/array-intersects.mjs";
import { truthiness } from "../../../util/truthiness.mjs";
import { uniqueArray } from "../../../util/unique-array.mjs";
import { BaseTarget } from "../base-target.mjs";

export class DamageTypeTarget extends BaseTarget {
    /** @type {TraitSelectorValuePlural} */
    damageTypes = { custom: '', values: [] };
    get #damageTypesArray() {
        return [...this.damageTypes.values, ...this.damageTypes.custom.split(';')]
            .map(x => x.trim()).filter(truthiness);
    }

    /**
     * @inheritdoc
     * @override
     */
    static get key() { return 'damage-type'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF | ActionUse} arg
     */
    static getBonusSourcesForTarget(arg) {
        if (arg instanceof pf1.components.ItemAction) {
            const actionDamageTypes = uniqueArray(
                arg.data.damage.parts.flatMap((part) => [...part.type.custom.split(';'), ...part.type.values])
                    .map(x => x.toLowerCase().trim())
                    .filter(truthiness)
            );
            return intersects(actionDamageTypes, this.#damageTypesArray);
        }

        if (arg instanceof pf1.documents.item.ItemAttackPF || arg instanceof pf1.documents.item.ItemWeaponPF) {
            const itemDamageTypes = uniqueArray(
                arg.actions.flatMap((action) => action.data.damage.parts.flatMap((part) => [...part.type.custom.split(';'), ...part.type.values]))
                    .map(x => x.toLowerCase().trim())
                    .filter(truthiness)
            );
            return intersects(itemDamageTypes, this.#damageTypesArray);
        }

        return false;
    }
}
