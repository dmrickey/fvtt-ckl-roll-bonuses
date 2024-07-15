import { MODULE_NAME } from "../../consts.mjs";
import { showChecklist } from "../../handlebars-handlers/targeted/targets/checklist-input.mjs";
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
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.iurMG1TBoX3auh5z#weapon-type'; }

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
        const groupsOnItem = item.system.baseTypes;
        if (!groupsOnItem?.length) {
            return [];
        }

        const bonusSources = sources.filter((sources) => {
            /** @type {string[]} */
            const types = sources.getFlag(MODULE_NAME, this.key);
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
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        const options = uniqueArray(item.actor?.items
            ?.filter(
                /** @returns {item is ItemWeaponPF | ItemAttackPF} */
                (item) => item.type === 'weapon' || item.type === 'attack')
            .flatMap((item) => item.system.baseTypes ?? []));
        options.sort();

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
