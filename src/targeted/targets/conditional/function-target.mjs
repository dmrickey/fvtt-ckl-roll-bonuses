import { MODULE_NAME } from '../../../consts.mjs';
import { showLabel } from '../../../handlebars-handlers/bonus-inputs/show-label.mjs';
import { textInput } from '../../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { showEnabledLabel } from '../../../handlebars-handlers/enabled-label.mjs';
import { localizeBonusTooltip } from '../../../util/localize.mjs';
import { BaseConditionalTarget } from './_base-conditional.target.mjs';

/**
 *
   (doc) => {
       const item = doc.item ?? doc;
       if (item instanceof pf1.documents.item.ItemSpellPF) {
           return !!(item.system?.types || '').includes('fear');
       }
   }
 */
export class FunctionTarget extends BaseConditionalTarget {

    static get #playerLabelKey() { return `${this.key}-player-label`; }

    /**
     * @override
     */
    static get sourceKey() { return 'function'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#*function'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @returns {string}
     */
    static fluentDescription(source) {
        return this.getHints(source)?.[0] || '';
    }

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

        const sources = item.actor.itemFlags?.boolean[this.key]?.sources ?? [];
        const filtered = sources.filter((source) => {
            const custom = source.getFlag(MODULE_NAME, this.key);
            if (custom) {
                try {
                    const func = eval(custom);
                    return !!func(doc);
                }
                catch {
                    console.error('invalid function target', source.uuid, source);
                    return false;
                }
            }
        });

        return filtered;
    };

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {string} func
     * @param {string} [label]
     * @returns {Promise<void>}
     */
    static async configure(item, func, label) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: func,
                    [this.#playerLabelKey]: label || this.label,
                },
            },
        });
    }

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
        if (game.user.isGM) {
            showLabel({
                item,
                journal: this.journal,
                key: this.key,
                parent: html,
            }, {
                inputType: 'target',
            });
            textInput({
                item,
                journal: this.journal,
                key: this.#playerLabelKey,
                parent: html,
                tooltip: localizeBonusTooltip(this.#playerLabelKey),
            }, {
                canEdit: isEditable,
                inputType: 'target',
                isFormula: false,
                isSubLabel: true,
            });
            textInput({
                item,
                journal: this.journal,
                key: this.key,
                parent: html,
                tooltip: this.tooltip,
            }, {
                canEdit: isEditable,
                inputType: 'target',
                isFormula: false,
                isSubLabel: true,
                textInputType: 'textarea',
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
            }, {
                canEdit: isEditable,
                inputType: 'target',
            });
        }
    }

    /** @override @returns { boolean } */
    static get gmOnlyForPicker() { return true; }

    /**
     * @override
     * @inheritdoc
     * @param {ActorPF} _actor
     * @param {ItemPF[]} sources
     * @param {ItemPF | ActionUse | ItemAction | undefined} _doc - originating doc event in case a specific action is needed
     * @returns {ItemPF[]}
     */
    static _filterToApplicableSources(_actor, sources, _doc) { return sources; }
}
