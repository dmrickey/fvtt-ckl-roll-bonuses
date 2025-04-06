import { MODULE_NAME } from '../../consts.mjs';
import { showChecklist } from '../../handlebars-handlers/targeted/targets/checklist-input.mjs';
import { intersects } from "../../util/array-intersects.mjs";
import { getActionDamageTypes } from '../../util/get-damage-types.mjs';
import { truthiness } from "../../util/truthiness.mjs";
import { uniqueArray } from "../../util/unique-array.mjs";
import { BaseTarget } from "./_base-target.mjs";

export class DamageTypeTarget extends BaseTarget {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'damage-type'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.iurMG1TBoX3auh5z#damage-type'; }

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
     * @param {ItemPF & {actor: ActorPF}} _item
     * @param {ItemPF[]} sources
     * @param {ItemPF | ActionUse | ItemAction} doc
     * @returns {ItemPF[]}
     */
    static _getSourcesFor(_item, sources, doc) {
        const filteredSources = sources.filter((source) => {
            const targetedTypes = source.getFlag(MODULE_NAME, this.key);
            const actionDamageTypes = getActionDamageTypes(doc);
            return intersects(actionDamageTypes, targetedTypes);
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
    static showInputOnItemSheet({ actor, html, isEditable, item }) {
        const custom = uniqueArray(
            uniqueArray([...(actor?.items ?? [])]
                .flatMap((item) => getActionDamageTypes(item)))
                .filter(type => !pf1.registry.damageTypes.get(type))
        );
        custom.sort();

        const options = {
            ...pf1.registry.damageTypes.getLabels(),
            ...custom.reduce((acc, curr) => ({ ...acc, [curr]: curr, }), {})
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
