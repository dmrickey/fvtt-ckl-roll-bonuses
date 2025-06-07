import { MODULE_NAME } from "../../consts.mjs";
import { traitInput } from '../../handlebars-handlers/trait-input.mjs';
import { intersects } from "../../util/array-intersects.mjs";
import { getWeaponTypesFromActor } from '../../util/get-weapon-types-from-actor.mjs';
import { toArray } from '../../util/to-array.mjs';
import { truthiness } from "../../util/truthiness.mjs";
import { uniqueArray } from "../../util/unique-array.mjs";
import { BaseTarget } from "./_base-target.mjs";

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
     * @param {ItemPF} source
     * @returns {string[]}
     */
    static #getTypes(source) {
        const types = source.getFlag(MODULE_NAME, this.key) ?? [];
        return types.filter(truthiness);
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        return this.#getTypes(source);
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF & {actor: ActorPF}} item
     * @param {ItemPF[]} sources
     * @returns {ItemPF[]}
     */
    static _getSourcesFor(item, sources) {
        const typesOnItem = item.system.baseTypes;
        if (!typesOnItem?.length) {
            return [];
        }

        const bonusSources = sources.filter((sources) => {
            const targetedTypes = this.#getTypes(sources);
            return intersects(typesOnItem, targetedTypes);
        });

        return bonusSources;
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {ArrayOrSelf<string>} weaponTypes
     * @returns {Promise<void>}
     */
    static async configure(item, weaponTypes) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: toArray(weaponTypes),
                },
            },
        });
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
        const typesOnActor = getWeaponTypesFromActor(item?.actor);
        const currentTypes = this.#getTypes(item);
        const choices = uniqueArray([...typesOnActor, ...currentTypes]);
        choices.sort();

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
