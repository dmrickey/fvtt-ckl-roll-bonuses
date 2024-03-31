import { MODULE_NAME } from '../../consts.mjs';
import { textInput } from '../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { BaseTarget } from './base-target.mjs';

export class FunctionTarget extends BaseTarget {

    static get #playerLabelKey() { return `${this.key}-player-label`; }

    /**
     * @override
     */
    static get sourceKey() { return 'function'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.iurMG1TBoX3auh5z#*function'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        /** @type {string[]} */
        if (source.getFlag(MODULE_NAME, this.key)) {
            return [source.getFlag(MODULE_NAME, this.#playerLabelKey) || this.label];
        }
    }

    /**
     * @inheritdoc
     * @override
     * @param {object} options
     * @param {ActorPF | null | undefined} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ html, item }) {
        if (game.user.isGM) {
            textInput({
                item,
                journal: this.journal,
                key: this.#playerLabelKey,
                parent: html,
                tooltip: this.tooltip,
            }, {
                isFormula: false,
                isModuleFlag: true,
            });
            textInput({
                item,
                journal: this.journal,
                key: this.key,
                parent: html,
                tooltip: this.tooltip,
            }, {
                isFormula: false,
                isModuleFlag: true,
            });
        }
        else {
            showEnabledLabel({
                item,
                journal: this.journal,
                key: this.key,
                label: item.getFlag(MODULE_NAME, this.#playerLabelKey) || this.label,
                parent: html,
                tooltip: this.tooltip,
            });
        }
    }

    /**
     * @inheritdoc
     * @override
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

        const sources = item.actor.itemFlags.boolean[this.key]?.sources ?? [];
        const filtered = sources.filter((source) => {
            const custom = source.getFlag(MODULE_NAME, this.key);
            const func = eval(custom);
            return !!custom && func(doc);
        });

        return filtered;
    };
}
