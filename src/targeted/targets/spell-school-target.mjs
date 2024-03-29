import { MODULE_NAME } from '../../consts.mjs';
import { showChecklist } from '../../handlebars-handlers/targeted/targets/checked-items-input.mjs';
import { FormulaCacheHelper } from '../../util/flag-helpers.mjs';
import { truthiness } from '../../util/truthiness.mjs';
import { BaseTarget } from './base-target.mjs';

export class SpellSchoolTarget extends BaseTarget {
    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'spell-school'; }

    /**
     * @override
     * @inheritdoc
    */
    static init() {
        FormulaCacheHelper.registerModuleFlag(this.key);
    }

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
            .map((/** @type {string} */ school) => pf1.config.spellSchools[school] || school);
        return schools;
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF | ActionUse | ItemAction} doc
     * @returns {ItemPF[]}
     */
    static getSourcesFor(doc) {
        const item = doc instanceof pf1.documents.item.ItemPF
            ? doc
            : doc.item;

        if (!item?.actor) {
            return [];
        }

        if (!(item instanceof pf1.documents.item.ItemSpellPF)
        ) {
            return [];
        }

        const spellSchool = item.system.school;
        if (!spellSchool) {
            return [];
        }

        const allSources = item.actor.itemFlags.boolean[this.key]?.sources ?? [];
        const filteredSources = allSources.filter((source) => {
            /** @type {string[]} */
            const schools = source.getFlag(MODULE_NAME, this.key) || [];
            if (!schools.length) {
                return false;
            }

            const targetedSchools = schools.filter(truthiness);
            return targetedSchools.includes(spellSchool);
        });

        return filteredSources;
    }

    /**
     * @override
     * @inheritdoc
     * @param {object} options
     * @param {ActorPF | null | undefined} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ actor, item, html }) {
        const options = pf1.config.spellSchools;

        showChecklist({
            item,
            key: this.key,
            parent: html,
            options,
        });
    }
}
