import { MODULE_NAME } from "../../consts.mjs";
import { showChecklist } from "../../handlebars-handlers/targeted/targets/checklist-input.mjs";
import { difference, intersects } from "../../util/array-intersects.mjs";
import { getActorItemsByTypes } from '../../util/get-actor-items-by-type.mjs';
import { truthiness } from "../../util/truthiness.mjs";
import { uniqueArray } from "../../util/unique-array.mjs";
import { BaseTarget } from "./_base-target.mjs";

/**
 * @extends BaseTarget
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
        if (!item.system.weaponGroups) {
            return [];
        }

        const groupsOnItem = [...(item.system.weaponGroups.total ?? [])]
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
        const actorGroups = getActorItemsByTypes(actor, 'attack', 'weapon')
            .flatMap((i) => [...i.system.weaponGroups.custom])
            .filter(truthiness);
        const targetedGroups = item.getFlag(MODULE_NAME, this.key) || [];
        const custom = difference(
            uniqueArray([
                ...targetedGroups,
                ...actorGroups,
            ]),
            Object.keys(pf1.config.weaponGroups),
        );
        custom.sort();

        const options = {
            ...pf1.config.weaponGroups,
            ...custom.reduce((acc, curr) => ({ ...acc, [curr]: curr, }), {}),
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
            inputType: 'target',
        });
    }
}
