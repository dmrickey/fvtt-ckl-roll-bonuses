import { MODULE_NAME } from "../../consts.mjs";
import { keyValueSelect } from '../../handlebars-handlers/bonus-inputs/key-value-select.mjs';
import { localize } from '../../util/localize.mjs';
import { truthiness } from '../../util/truthiness.mjs';
import { BaseTarget } from "./base-target.mjs";

// todo doesn't exist until v10
// /** @type {Record<string, string>} */
// const choices =  /** @type {const} */ ({
//     lawful: pf1.config.damageResistances.lawful,
//     chaotic: pf1.config.damageResistances.chaotic,
//     good: pf1.config.damageResistances.good,
//     evil: pf1.config.damageResistances.evil,
// });

/** @type {Record<string, string>} */
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
 * @augments BaseTarget
 */
export class AlignmentTarget extends BaseTarget {
    /**
     * @inheritdoc
     * @override
     */
    static get sourceKey() { return 'alignment'; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.iurMG1TBoX3auh5z#alignment'; }

    /**
     * @override
     */
    static init() {

        Hooks.once('ready', () =>
            Object.entries(choices).forEach(([key, value]) => choices[key] = localize(value))
        );
    }

    /** @type {ActorPF[]} */
    static get #currentTargetedActors() {
        return [...game.user.targets]
            .map(x => x.actor)
            .filter(truthiness);
    }

    /**
     *
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
     * @param {ItemPF | ActionUse | ItemAction} doc
     * @returns {ItemPF[]}
     */
    static getSourcesFor(doc) {
        if (!this.#currentTargetedActors.length) {
            return [];
        }

        const item = doc instanceof pf1.documents.item.ItemPF
            ? doc
            : doc.item;
        if (!item.uuid || !item.actor) {
            return [];
        }

        const flaggedSources = item.actor.itemFlags.boolean[this.key]?.sources ?? [];
        const bonusSources = flaggedSources.filter((source) => {
            const bonusAlignment = this.#getFlagLetter(source);
            if (!bonusAlignment) return false;

            return this.#currentTargetedActors.some((actor) => actor.system.details.alignment?.includes(bonusAlignment));
        });

        return bonusSources;
    }

    /**
     * @override
     * @returns {boolean}
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
        keyValueSelect({
            choices,
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            isModuleFlag: true
        });
    }
}
