import { textInput } from '../../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { Distance } from '../../../util/distance.mjs';
import { FormulaCacheHelper } from '../../../util/flag-helpers.mjs';
import { ItemTarget } from "../item-target.mjs";

export class WhenTargetInRange extends ItemTarget {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'is-target-within-range'; }

    static get #minKey() { return `${this.key}-min`; }
    static get #maxKey() { return `${this.key}-max`; }

    /** @param {ItemPF} source */
    static #min(source) { return FormulaCacheHelper.getModuleFlagValue(source, this.#minKey); }
    /** @param {ItemPF} source */
    static #max(source) { return FormulaCacheHelper.getModuleFlagValue(source, this.#maxKey); }

    /**
     * @override
     * @inheritdoc
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#is-target-within-range'; }

    /**
     * @override
     * @inheritdoc
     */
    static init() {
        FormulaCacheHelper.registerModuleFlag(this.#minKey);
        FormulaCacheHelper.registerModuleFlag(this.#maxKey);
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const min = this.#min(source);
        const max = this.#max(source);
        const units = 'ft'
        return [`${min}${units}-${max}${units}`];
    }

    /**
     * @override
     * @param {ItemPF | ActionUse | ItemAction} doc
     * @returns {ItemPF[]}
     */
    static getSourcesFor(doc) {
        const item = doc instanceof pf1.documents.item.ItemPF
            ? doc
            : doc.item;
        const token = item.actor?.getActiveTokens()[0];
        if (!item.actor || !token) {
            return [];
        }

        /** @type {TokenPF[]} */
        const targets = [...game.user.targets];
        if (!targets.length) {
            return [];
        }

        const flaggedItems = item.actor.itemFlags?.boolean[this.key]?.sources ?? [];
        const filtered = flaggedItems.filter((item) => {
            const min = this.#min(item);
            const max = this.#max(item);
            return targets.every((target) => new Distance(token, target).isWithinRange(min, max));
        });
        return filtered;
    }

    /**
     * @override
     * @inheritdoc
     */
    static get isConditionalTarget() { return true; }

    /**
     * @override
     * @inheritdoc
     */
    static get isGenericTarget() { return true; }

    /**
     * @inheritdoc
     * @override
     * @param {object} options
     * @param {ActorPF | null | undefined} options.actor
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        textInput({
            item,
            journal: this.journal,
            key: this.#minKey,
            parent: html,
        }, {
            canEdit: isEditable,
            isModuleFlag: true,
        });
        textInput({
            item,
            journal: this.journal,
            key: this.#maxKey,
            parent: html,
        }, {
            canEdit: isEditable,
            isModuleFlag: true,
        });
    }
}
