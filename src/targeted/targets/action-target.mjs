import { MODULE_NAME } from '../../consts.mjs';
import { showActionInput } from '../../handlebars-handlers/targeted/targets/action-input.mjs';
import { toArray } from '../../util/to-array.mjs';
import { truthiness } from '../../util/truthiness.mjs';
import { BaseTarget } from "./_base-target.mjs";

export class ActionTarget extends BaseTarget {
    /**
     * @inheritdoc
     * @override
     * @param {ItemPF | ActionUse | ItemAction} doc
     * @returns {ItemPF[]}
     */
    static getSourcesFor(doc) {
        const action =
            doc instanceof pf1.actionUse.ActionUse
                ? doc.action
                : doc instanceof pf1.documents.item.ItemPF
                    ? doc.defaultAction
                    : doc;
        if (!action?.actor || !action.id || !action.item) {
            return [];
        }

        const sources = action.actor.itemFlags?.boolean[this.key]?.sources ?? [];

        const bonusSources = sources.filter((flagged) => {
            /** @type {string[]} */
            const targetActionIds = flagged.getFlag(MODULE_NAME, this.key) || [];
            return targetActionIds.includes(`${action.item.id}.${action.id}`);
        });

        return bonusSources;
    };

    /**
     * @override
     */
    static get sourceKey() { return 'action'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.iurMG1TBoX3auh5z#specific-action'; }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        if (!source?.actor) return [];

        /** @type {string[]} */
        const ids = source.getFlag(MODULE_NAME, this.key) ?? [];
        return ids.map((id) => {
            const [itemId, actionId] = id.split('.');
            if (!itemId || !actionId) return;

            const item = source.actor?.items.get(itemId);
            const action = item?.actions.get(actionId);
            if (!item || !action) return;
            return `${item.name} - ${action.name}`;
        }).filter(truthiness);
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {`${ItemPF['id']}.${ItemAction['id']}`[]} actionIds
     * @returns {Promise<void>}
     */
    static async configure(item, actionIds) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: toArray(actionIds),
                },
            },
        });
    }

    /**
     * @override
     * @param {object} options
     * @param {ActorPF | null | undefined} options.actor
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        showActionInput({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
        });
    }
}
