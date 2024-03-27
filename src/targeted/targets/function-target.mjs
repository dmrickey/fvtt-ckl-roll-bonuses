import { MODULE_NAME } from '../../consts.mjs';
import { textInput } from '../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { localize } from '../../util/localize.mjs';
import { BaseTarget } from './base-target.mjs';

export class FunctionTarget extends BaseTarget {

    static get #hintLabelKey() { return `${this.key}-hint-label`; }

    /**
     * @override
     */
    static get sourceKey() { return 'function'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        /** @type {string[]} */
        if (source.getFlag(MODULE_NAME, this.key)) {
            return [source.getFlag(MODULE_NAME, this.#hintLabelKey) || this.label];
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
                label: localize(this.#hintLabelKey),
                item,
                key: this.#hintLabelKey,
                parent: html,
            }, {
                isFormula: false,
                isModuleFlag: true,
            });
            textInput({
                label: this.label,
                item,
                key: this.key,
                parent: html,
            }, {
                isFormula: false,
                isModuleFlag: true,
            });
        }
        else {
            showEnabledLabel({
                label: item.getFlag(MODULE_NAME, this.#hintLabelKey) || this.label,
                parent: html,
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
