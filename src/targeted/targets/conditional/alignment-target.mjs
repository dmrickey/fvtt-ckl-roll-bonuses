import { MODULE_NAME } from "../../../consts.mjs";
import { keyValueSelect } from '../../../handlebars-handlers/bonus-inputs/key-value-select.mjs';
import { currentTargetedActors } from '../../../util/get-current-targets.mjs';
import { localize } from '../../../util/localize.mjs';
import { BaseTarget } from "../base-target.mjs";

// todo doesn't exist until v10
// /** @type {Record<string, string>} */
// const choices =  /** @type {const} */ ({
//     lawful: pf1.config.damageResistances.lawful,
//     chaotic: pf1.config.damageResistances.chaotic,
//     good: pf1.config.damageResistances.good,
//     evil: pf1.config.damageResistances.evil,
// });

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
     * @inheritdoc
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#alignment'; }

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
     * @param {ItemPF & { actor: ActorPF }} _item
     * @param {ItemPF[]} sources
     * @returns {ItemPF[]}
     */
    static _getSourcesFor(_item, sources) {
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
     * @override
     * @inheritdoc
     */
    static get isConditionalTarget() { return true; }

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
