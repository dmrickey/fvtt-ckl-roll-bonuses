import { MODULE_NAME } from '../../consts.mjs';
import { traitInput } from '../../handlebars-handlers/trait-input.mjs';
import { intersects } from '../../util/array-intersects.mjs';
import { toArray } from '../../util/to-array.mjs';
import { truthiness } from '../../util/truthiness.mjs';
import { BaseTarget } from './_base-target.mjs';

export class SpellSchoolTarget extends BaseTarget {
    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'spell-school'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.iurMG1TBoX3auh5z#spell-school'; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
    */
    static getHints(source) {
        const groups = source.getFlag(MODULE_NAME, this.key) || [];
        const schools = groups
            .filter(truthiness)
            .map((/** @type {SpellSchool} */ school) => pf1.config.spellSchools[school] || school);
        return schools;
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

        const spellSchool = item.system.school;
        if (!spellSchool) {
            return [];
        }

        const filteredSources = sources.filter((source) => {
            /** @type {string[]} */
            const targetedSchools = (source.getFlag(MODULE_NAME, this.key) || [])
                .filter(truthiness);

            return intersects(targetedSchools, spellSchool);
        });

        return filteredSources;
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {ArrayOrSelf<SpellSchool>} schools
     * @returns {Promise<void>}
     */
    static async configure(item, schools) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: toArray(schools),
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
        const choices = pf1.config.spellSchools;

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
