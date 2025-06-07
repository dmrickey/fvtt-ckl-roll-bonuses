import { MODULE_NAME } from "../../consts.mjs";
import { traitInput } from '../../handlebars-handlers/trait-input.mjs';
import { intersects } from "../../util/array-intersects.mjs";
import { getWeaponGroupChoicesFromActor } from '../../util/get-weapon-groups-from-actor.mjs';
import { toArray } from '../../util/to-array.mjs';
import { truthiness } from "../../util/truthiness.mjs";
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
     * @param {ItemPF} item
     * @param {ArrayOrSelf<WeaponGroup>} weaponGroups
     * @returns {Promise<void>}
     */
    static async configure(item, weaponGroups) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: toArray(weaponGroups),
                },
            },
        });
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
        const choices = getWeaponGroupChoicesFromActor(actor);

        traitInput({
            choices,
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'target',
        });
    }
}
