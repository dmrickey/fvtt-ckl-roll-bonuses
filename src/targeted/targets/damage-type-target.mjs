import { MODULE_NAME } from '../../consts.mjs';
import { traitInput } from '../../handlebars-handlers/trait-input.mjs';
import { intersects } from "../../util/array-intersects.mjs";
import { getActionDamageTypes } from '../../util/get-damage-types.mjs';
import { toArray } from '../../util/to-array.mjs';
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
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {ArrayOrSelf<keyof DamageTypes>} damageTypes
     * @returns {Promise<void>}
     */
    static async configure(item, damageTypes) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: toArray(damageTypes),
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
    static showInputOnItemSheet({ actor, html, isEditable, item }) {
        const custom = uniqueArray(
            uniqueArray([...(actor?.items ?? [])]
                .flatMap((item) => getActionDamageTypes(item)))
                .filter(type => !pf1.registry.damageTypes.get(type))
        );
        custom.sort();

        const choices = {
            ...pf1.registry.damageTypes.getLabels(),
            ...custom.reduce((acc, curr) => ({ ...acc, [curr]: curr, }), {})
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
