import { MODULE_NAME } from '../../consts.mjs';
import { traitInput } from '../../handlebars-handlers/trait-input.mjs';
import { intersects } from '../../util/array-intersects.mjs';
import { toArray } from '../../util/to-array.mjs';
import { Trait } from '../../util/trait-builder.mjs';
import { BaseTarget } from './_base-target.mjs';

export class SpellSubschoolTarget extends BaseTarget {
    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'spell-subschool'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.iurMG1TBoX3auh5z#spell-subschool'; }

    /**
     * @param {ItemPF} source
     * @returns {Trait}
     */
    static #getSubschoolTraits(source) {
        const choices = pf1.config.spellSubschools;
        const flag = source.getFlag(MODULE_NAME, this.key);
        const subtypes = new Trait(choices, flag);
        return subtypes;
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
    */
    static getHints(source) {
        const subschools = this.#getSubschoolTraits(source);
        return subschools.names;
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF & {actor: ActorPF}} item
     * @param {ItemPF[]} sources
     * @returns {ItemPF[]}
     */
    static _getSourcesFor(item, sources) {
        if (!(item instanceof pf1.documents.item.ItemSpellPF)) {
            return [];
        }

        const subschools = item.system.subschool;
        if (!subschools.total.size) {
            return [];
        }

        const filteredSources = sources.filter((source) => {
            const targetedSubschools = this.#getSubschoolTraits(source);
            return intersects(subschools.total, targetedSubschools.total);
        });

        return filteredSources;
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {ArrayOrSelf<SpellSubschool>} subSchools
     * @returns {Promise<void>}
     */
    static async configure(item, subSchools) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: toArray(subSchools),
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
        const choices = pf1.config.spellSubschools;

        traitInput({
            choices,
            hasCustom: false,
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
