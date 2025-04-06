import { MODULE_NAME } from '../../consts.mjs';
import { showChecklist } from '../../handlebars-handlers/targeted/targets/checklist-input.mjs';
import { intersects } from '../../util/array-intersects.mjs';
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
        const options = {
            ...pf1.config.spellDescriptors,
            ...(custom.reduce((acc, x) => ({ ...acc, [x]: x }), {})),
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
