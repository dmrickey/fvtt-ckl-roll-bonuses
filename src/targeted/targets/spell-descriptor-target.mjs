import { MODULE_NAME } from '../../consts.mjs';
import { traitInput } from '../../handlebars-handlers/trait-input.mjs';
import { intersects } from '../../util/array-intersects.mjs';
import { toArray } from '../../util/to-array.mjs';
import { truthiness } from '../../util/truthiness.mjs';
import { uniqueArray } from '../../util/unique-array.mjs';
import { BaseTarget } from './_base-target.mjs';

export class SpellDescriptorTarget extends BaseTarget {
    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'spell-descriptor'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.iurMG1TBoX3auh5z#spell-descriptor'; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
    */
    static getHints(source) {
        const values = source.getFlag(MODULE_NAME, this.key) || [];
        const descriptors = values
            .filter(truthiness)
            .map((/** @type {keyof typeof pf1.config.spellDescriptors} */ descriptor) => pf1.config.spellDescriptors[descriptor] || descriptor);
        return descriptors;
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

        const descriptors = [...item.system.descriptors?.total ?? []];
        if (!descriptors.length) {
            return [];
        }

        const filteredSources = sources.filter((source) => {
            /** @type {string[]} */
            const targetedDescriptors = (source.getFlag(MODULE_NAME, this.key) || [])
                .filter(truthiness);
            if (!targetedDescriptors.length) {
                return false;
            }

            return intersects(targetedDescriptors, descriptors);;
        });

        return filteredSources;
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {ArrayOrSelf<SpellDescriptor>} descriptors
     * @returns {Promise<void>}
     */
    static async configure(item, descriptors) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: toArray(descriptors),
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
        /** @type {string[]} */
        let custom = [];
        if (item.actor) {
            custom = uniqueArray(item.actor.itemTypes.spell.flatMap(x => [...x.system.descriptors.custom]));
        }
        const choices = {
            ...pf1.config.spellDescriptors,
            ...(custom.reduce((acc, x) => ({ ...acc, [x]: x }), {})),
        };

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
