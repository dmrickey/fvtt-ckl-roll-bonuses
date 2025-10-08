import { MODULE_NAME } from "../../../consts.mjs";
import { keyValueSelect } from '../../../handlebars-handlers/bonus-inputs/key-value-select.mjs';
import { currentTargetedActors } from '../../../util/get-current-targets.mjs';
import { localize, localizeFluentDescription } from '../../../util/localize.mjs';
import { BaseConditionalTarget } from './_base-conditional.target.mjs';

const choices =  /** @type {const} */ ({
    lawful: 'alignment.lawful',
    chaotic: 'alignment.chaotic',
    good: 'alignment.good',
    evil: 'alignment.evil',
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
     * @returns {Nullable<string>}
     */
    static #getFlagLetter(item) {
        /** @type {AlignmentOptions} */
        const current = item.getFlag(MODULE_NAME, this.key);
        switch (current) {
            case 'chaotic': return 'c';
            case 'evil': return 'e';
            case 'good': return 'g';
            case 'lawful': return 'l';
            default: return null;
        }
    }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        /** @type {AlignmentOptions} */
        const alignment = source.getFlag(MODULE_NAME, this.key);
        if (alignment) {
            return [choices[alignment]];
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
            const bonusAlignment = this.#getFlagLetter(source);
            if (!bonusAlignment) return false;

            return currentTargetedActors().some((actor) => actor.system.details.alignment?.includes(bonusAlignment));
        });

        return bonusSources;
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {keyof typeof choices} alignment
     * @returns {Promise<void>}
     */
    static async configure(item, alignment) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: { [this.key]: alignment || Object.keys(choices)[0] },
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
        keyValueSelect({
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
