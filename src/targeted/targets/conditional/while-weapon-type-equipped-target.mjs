import { MODULE_NAME } from '../../../consts.mjs';
import { traitInput } from '../../../handlebars-handlers/trait-input.mjs';
import { intersects } from '../../../util/array-intersects.mjs';
import { currentTargetedActors } from '../../../util/get-current-targets.mjs';
import { getWeaponTypesFromActor } from '../../../util/get-weapon-types-from-actor.mjs';
import { localizeFluentDescription } from '../../../util/localize.mjs';
import { toArray } from '../../../util/to-array.mjs';
import { truthiness } from '../../../util/truthiness.mjs';
import { uniqueArray } from '../../../util/unique-array.mjs';
import { BaseConditionalTarget } from './_base-conditional.target.mjs';

/**
 * @extends BaseConditionalTarget
 */
export class WhileWeaponTypeTarget extends BaseConditionalTarget {
    /**
     * @inheritdoc
     * @override
     */
    static get sourceKey() { return 'while-weapon-type-equipped'; }

    /**
     * @todo
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#while-weapon-type-equipped'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @returns {string}
     */
    static fluentDescription(source) {
        const hints = this.getHints(source);
        return localizeFluentDescription(this, { size: hints?.[0] || '' });
    }
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
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const weaponTypes = this.#getTypes(source);
        if (weaponTypes.length) {
            return weaponTypes;
        }
    }

    /**
     * @inheritdoc
     * @override
     * @param {ActorPF} actor
     * @param {ItemPF[]} sources
     * @returns {ItemPF[]}
     */
    static _filterToApplicableSources(actor, sources) {
        const currentTargets = currentTargetedActors();
        if (!currentTargets.length) return [];

        const bonusSources = sources.filter((source) => {
            const weaponTypes = this.#getTypes(source);
            const equipped = getWeaponTypesFromActor(actor, { onlyEquipped: true });
            return intersects(weaponTypes, equipped);
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
     * @inheritdoc
     * @override
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
