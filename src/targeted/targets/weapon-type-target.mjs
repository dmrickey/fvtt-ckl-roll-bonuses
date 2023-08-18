import { MODULE_NAME } from "../../consts.mjs";
import { showChecklist } from "../../handlebars-handlers/targeted/targets/checked-items-input.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { getDocFlags } from "../../util/flag-helpers.mjs";
import { truthiness } from "../../util/truthiness.mjs";
import { uniqueArray } from "../../util/unique-array.mjs";
import { BaseTarget } from "./base-target.mjs";

export class WeaponTypeTarget extends BaseTarget {
    /** @type {string[]} */
    baseTypes = [];

    /**
     * @inheritdoc
     * @override
     */
    static get type() { return 'weapon-type'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF | ActionUse | ItemAction} doc
     * @returns {ItemPF[]}
     */
    static isTarget(doc) {
        const item = doc instanceof pf1.documents.item.ItemPF
            ? doc
            : doc.item;
        if (!(item instanceof pf1.documents.item.ItemAttackPF
            || item instanceof pf1.documents.item.ItemWeaponPF)
        ) {
            return [];
        }
        const groupsOnItem = item.system.baseTypes;
        if (!groupsOnItem?.length) {
            return [];
        }

        const flaggedItems = item.actor.itemFlags.boolean[this.key]?.sources ?? [];
        const bonusTargets = flaggedItems.filter((flagged) => {
            /** @type {string[]} */
            const types = flagged.getFlag(MODULE_NAME, this.key);
            if (!types) {
                return false;
            }

            const targetedGroups = types.filter(truthiness);
            return intersects(groupsOnItem, targetedGroups);
        });

        return bonusTargets;
    }

    /**
     * @inheritdoc
     * @override
     * @param {object} options
     * @param {ActorPF | null | undefined} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ actor, item, html }) {
        const options = uniqueArray(item.actor?.items
            ?.filter(
                /** @returns {item is ItemWeaponPF | ItemAttackPF} */
                (item) => item.type === 'weapon' || item.type === 'attack')
            .flatMap((item) => item.system.baseTypes ?? []));
        options.sort();

        showChecklist({
            item,
            flag: this.key,
            label: this.label,
            parent: html,
            options,
        });
    }
}
