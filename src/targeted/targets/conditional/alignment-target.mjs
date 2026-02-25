import { MODULE_NAME } from "../../../consts.mjs";
import { traitInput } from "../../../handlebars-handlers/trait-input.mjs";
import { intersects } from "../../../util/array-intersects.mjs";
import { currentTargetedActors } from '../../../util/get-current-targets.mjs';
import { listFormat } from "../../../util/list-format.mjs";
import { localize, localizeFluentDescription } from '../../../util/localize.mjs';
import { toArray } from "../../../util/to-array.mjs";
import { BaseConditionalTarget } from './_base-conditional.target.mjs';

const choices =  /** @type {const} */ ({
    "lg": "PF1.Alignments.lg",
    "ng": "PF1.Alignments.ng",
    "cg": "PF1.Alignments.cg",
    "ln": "PF1.Alignments.ln",
    "tn": "PF1.Alignments.tn",
    "cn": "PF1.Alignments.cn",
    "le": "PF1.Alignments.le",
    "ne": "PF1.Alignments.ne",
    "ce": "PF1.Alignments.ce",
});

/**
 * @typedef {keyof typeof choices} AlignmentOptions
 */

/**
 * @extends BaseConditionalTarget
 */
export class AlignmentTarget extends BaseConditionalTarget {
    /**
     * @inheritdoc
     * @override
     */
    static get sourceKey() { return 'alignment'; }

    /**
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#alignment'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @returns {string}
     */
    static fluentDescription(source) { return localizeFluentDescription(this, { alignment: this.getHints(source)?.[0] || '' }); }

    /**
     * @inheritdoc
     * @override
     */
    static init() {
        Hooks.once('ready', () =>
            // @ts-ignore
            Object.entries(choices).forEach(([key, value]) => choices[key] = localize(value))
        );
    }

    /**
     * @param {ItemPF} item
     * @returns {AlignmentOptions[]}
     */
    static #getConfigured(item) {
        /** @type {AlignmentOptions[]} */
        const current = item.getFlag(MODULE_NAME, this.key);
        return current || [];
    }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const alignments = this.#getConfigured(source);
        if (alignments.length) {
            return [listFormat(alignments.map(alignment => choices[alignment]), "or")];
        }
    }

    /**
     * @inheritdoc
     * @override
     * @param {ActorPF} _actor
     * @param {ItemPF[]} sources
     * @returns {ItemPF[]}
     */
    static _filterToApplicableSources(_actor, sources) {
        if (!currentTargetedActors().length) {
            return [];
        }

        const bonusSources = sources.filter((source) => {
            const alignments = this.#getConfigured(source);
            if (!alignments.length) return false;

            return currentTargetedActors().some((actor) => intersects(actor.system.details.alignment, alignments));
        });

        return bonusSources;
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {ArrayOrSelf<keyof typeof choices>} alignment
     * @returns {Promise<void>}
     */
    static async configure(item, alignment) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: { [this.key]: alignment ? toArray(alignment) : [Object.keys(choices)[0]] },
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
