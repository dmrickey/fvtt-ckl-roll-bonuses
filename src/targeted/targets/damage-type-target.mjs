import { MODULE_NAME } from '../../consts.mjs';
import { showChecklist } from '../../handlebars-handlers/targeted/targets/checklist-input.mjs';
import { intersects } from "../../util/array-intersects.mjs";
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

            const action = doc instanceof pf1.components.ItemAction
                ? doc
                : doc instanceof pf1.actionUse.ActionUse
                    ? doc.action
                    : null;
            if (action) {
                const actionDamageTypes = uniqueArray(
                    action.data.damage.parts
                        .flatMap((part) => [...part.type.custom.split(';'), ...part.type.values])
                        .map(x => x.trim())
                        .filter(truthiness)
                );
                return intersects(actionDamageTypes, targetedTypes);
            }

            if (doc instanceof pf1.documents.item.ItemPF) {
                const itemDamageTypes = uniqueArray(
                    [...(doc.actions ?? [])]
                        .flatMap((action) => action.data.damage.parts.flatMap((part) => [...part.type.custom.split(';'), ...part.type.values]))
                        .map(x => x.trim())
                        .filter(truthiness)
                );
                return intersects(itemDamageTypes, targetedTypes);
            }

            return false;
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
            [...(actor?.items ?? [])]
                .flatMap((i) => [...(i?.actions ?? [])])
                .filter(truthiness)
                .flatMap((action) => action.data.damage)
                .flatMap((damagePart) => damagePart.parts)
                .flatMap((part) => (part.type?.custom ?? '').split(';'))
                .filter(truthiness)
            ?? []
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
