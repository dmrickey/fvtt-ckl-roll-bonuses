import { MODULE_NAME } from "../../consts.mjs";
import { weaponTypeInput } from "../../handlebars-handlers/targeted/targets/weapon-group-input.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { getDocFlags } from "../../util/flag-helpers.mjs";
import { truthiness } from "../../util/truthiness.mjs";
import { uniqueArray } from "../../util/unique-array.mjs";
import { BaseTarget } from "./base-target.mjs";

/**
 * @augments BaseTarget
 */
export class WeaponGroupTarget extends BaseTarget {
    /**
     * @inheritdoc
     * @override
     */
    static get type() { return 'weapon-group'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF | ActionUse | ItemAction} doc
     * @returns {boolean}
     */
    static isTarget(doc) {
        const item = doc instanceof pf1.documents.item.ItemPF
            ? doc
            : doc.item;
        if (!(item instanceof pf1.documents.item.ItemAttackPF
            || item instanceof pf1.documents.item.ItemWeaponPF)
        ) {
            return false;
        }
        if (!item.system.weaponGroups) {
            return false;
        }

        const targetedGroups = this.#getCurrentTargets(item.actor);

        const groupsOnItem = [...item.system.weaponGroups.value, ...item.system.weaponGroups.custom.split(';')]
            .map(x => x.trim())
            .filter(truthiness);
        return intersects(groupsOnItem, targetedGroups);
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
        const custom = uniqueArray(
            actor?.items
                .filter(
                    /** @returns {i is ItemWeaponPF | ItemAttackPF} */
                    (i) => i instanceof pf1.documents.item.ItemWeaponPF || i instanceof pf1.documents.item.ItemAttackPF
                )
                .flatMap((i) => (i.system.weaponGroups?.custom ?? '').split(';'))
                .filter(truthiness)
            ?? []
        );

        weaponTypeInput({
            item,
            key: this.key,
            parent: html,
            custom
        });
    }

    /**
     * @param {ActorPF | null} actor
     * @returns
     */
    static #getCurrentTargets(actor) {
        /** @type {TraitSelector[]} */
        const values = getDocFlags(actor, this.key);
        const selected = values.flatMap(({ value, custom }) => [...value, ...custom.split(';')])
            .map(x => x.trim())
            .filter(truthiness);
        return selected
    }
}
