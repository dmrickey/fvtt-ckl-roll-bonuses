import { MODULE_NAME } from '../../../consts.mjs';
import { keyValueSelect } from '../../../handlebars-handlers/bonus-inputs/key-value-select.mjs';
import { textInput } from '../../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { api } from '../../../util/api.mjs';
import { difference } from '../../../util/array-intersects.mjs';
import { currentTargetedActors } from '../../../util/get-current-targets.mjs';
import { BaseTarget } from '../_base-target.mjs';

const targetChoices =  /** @type {const} */ ({
    self: 'target-choice.self',
    target: 'target-choice.target',
});

/**
 * @typedef {keyof typeof targetChoices} TargetOptions
 */

/**
 * @extends {BaseTarget}
 */
export class HasBooleanFlagTarget extends BaseTarget {
    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'has-boolean-flag'; }
    static get #targetKey() { return `${this.key}-target`; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#has-boolean-flag'; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
    */
    static getHints(source) {
        const value = source.getFlag(MODULE_NAME, this.key);
        const targetOrSelf = this.#getTargetType(source);
        if (value) {
            return [`${value} - ${targetChoices[targetOrSelf]}`];
        }
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF & { actor: ActorPF }} item
     * @param {ItemPF[]} sources
     * @returns {ItemPF[]}
     */
    static _getSourcesFor(item, sources) {
        const currentTargets = currentTargetedActors();

        const filteredSources = sources.filter((source) => {
            const targetOrSelf = this.#getTargetType(source);
            const value = source.getFlag(MODULE_NAME, this.key);

            if (!value) {
                return false;
            }
            else if (targetOrSelf === 'self') {
                return item.actor.hasItemBooleanFlag(value);
            }
            else {
                return currentTargets.length
                    && currentTargets.every((a) => a.hasItemBooleanFlag(value));
            }
        });

        return filteredSources;
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
     * @override
     * @inheritdoc
     * @param {object} options
     * @param {ActorPF | null | undefined} options.actor
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        const flags = Object.keys(item.actor?.itemFlags?.boolean ?? {});
        const choices = difference(
            flags,
            [
                ...api.SpecificBonuses.allBonusKeys,
                ...api.allBonusTypesKeys,
                ...api.allGlobalTypesKeys,
                ...api.allTargetTypesKeys,
                ...api.allTargetOverrideTypesKeys,
            ]
        );
        choices.sort();

        textInput({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
            tooltip: this.tooltip,
            choices,
        }, {
            canEdit: isEditable,
            inputType: 'target',
            isFormula: false,
        });

        keyValueSelect({
            choices: targetChoices,
            item,
            journal: this.journal,
            key: this.#targetKey,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'target',
            isSubLabel: true,
        });
    }

    /**
     * @param {ItemPF} source
     * @returns {TargetOptions}
     */
    static #getTargetType(source) {
        return source.getFlag(MODULE_NAME, this.#targetKey) || 'self';
    }
}
