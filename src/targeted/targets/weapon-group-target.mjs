import { MODULE_NAME } from "../../consts.mjs";
import { showChecklist } from "../../handlebars-handlers/targeted/targets/checklist-input.mjs";
import { intersects } from "../../util/array-intersects.mjs";
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
    static get sourceKey() { return 'weapon-group'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.iurMG1TBoX3auh5z#weapon-group'; }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        /** @type {(keyof WeaponGroups)[]} */
        const groups = source.getFlag(MODULE_NAME, this.key) ?? [];
        return groups.map((group) => pf1.config.weaponGroups[group] || group).filter(truthiness);
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF & {actor: ActorPF}} item
     * @param {ItemPF[]} sources
     * @returns {ItemPF[]}
     */
    static _getSourcesFor(item, sources) {
        if (!(item instanceof pf1.documents.item.ItemAttackPF
            || item instanceof pf1.documents.item.ItemWeaponPF)
        ) {
            return [];
        }
        if (!item.system.weaponGroups) {
            return [];
        }

        const groupsOnItem = [...item.system.weaponGroups.value, ...item.system.weaponGroups.custom]
            .map(x => x.trim())
            .filter(truthiness);

        const bonusSources = sources.filter((source) => {
            const targetedGroups = source.getFlag(MODULE_NAME, this.key) || [];
            return intersects(groupsOnItem, targetedGroups);
        });

        return bonusSources;
    }

    /**
     * @inheritdoc
     * @override
     * @param {object} options
     * @param {ActorPF | null | undefined} options.actor
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ actor, html, isEditable, item }) {
        const custom = uniqueArray(
            actor?.items
                .filter(
                    /** @returns {i is ItemWeaponPF | ItemAttackPF} */
                    (i) => i instanceof pf1.documents.item.ItemWeaponPF || i instanceof pf1.documents.item.ItemAttackPF
                )
                .flatMap((i) => (i.system.weaponGroups?.custom ?? []))
                .filter(truthiness)
            ?? []
        );
        custom.sort();

        const options = {
            ...pf1.config.weaponGroups,
            ...custom.reduce((acc, curr) => ({ ...acc, [curr]: curr, }), {})
        };

        showChecklist({
            item,
            journal: this.journal,
            key: this.key,
            options,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
        });
    }
}
