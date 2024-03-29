import { MODULE_NAME } from "../../consts.mjs";
import { showChecklist } from "../../handlebars-handlers/targeted/targets/checked-items-input.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { truthiness } from "../../util/truthiness.mjs";
import { uniqueArray } from "../../util/unique-array.mjs";
import { BaseTarget } from "./base-target.mjs";

export class WeaponTypeTarget extends BaseTarget {
    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'weapon-type'; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const groups = source.getFlag(MODULE_NAME, this.key) ?? [];
        return groups.filter(truthiness);
    }

    /**
     * @override
     * @inheritdoc
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
        const bonusSources = flaggedItems.filter((flagged) => {
            /** @type {string[]} */
            const types = flagged.getFlag(MODULE_NAME, this.key);
            if (!types) {
                return false;
            }

            const targetedGroups = types.filter(truthiness);
            return intersects(groupsOnItem, targetedGroups);
        });

        return bonusSources;
    }

    /**
     * @override
     * @inheritdoc
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
            key: this.key,
            parent: html,
            options,
        });
    }
}
