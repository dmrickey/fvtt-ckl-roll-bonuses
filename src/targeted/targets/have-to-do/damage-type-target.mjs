import { MODULE_NAME } from '../../../consts.mjs';
import { showChecklist } from '../../../handlebars-handlers/targeted/targets/checked-items-input.mjs';
import { intersects } from "../../../util/array-intersects.mjs";
import { truthiness } from "../../../util/truthiness.mjs";
import { uniqueArray } from "../../../util/unique-array.mjs";
import { BaseTarget } from "../base-target.mjs";

export class DamageTypeTarget extends BaseTarget {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'damage-type'; }

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

        const bonusSources = item.actor.itemFlags.boolean[this.key]?.sources ?? [];

        const filteredSources = bonusSources.filter((source) => {
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
                    doc.actions
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
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ actor, item, html }) {
        const custom = uniqueArray(
            [...(actor?.items ?? [])]
                .flatMap((i) => [...i.actions])
                .filter(truthiness)
                .flatMap((action) => action.data.damage)
                .flatMap((damagePart) => damagePart.parts)
                .flatMap((part) => (part.type?.custom ?? '').split(';'))
                .filter(truthiness)
            ?? []
        );
        custom.sort();

        const options = {
            ...pf1.config.damageTypes,
            ...custom.reduce((acc, curr) => ({ ...acc, [curr]: curr, }), {})
        };

        showChecklist({
            item,
            key: this.key,
            parent: html,
            options,
        });
    }
}
