import { MODULE_NAME } from '../../../consts.mjs';
import { keyValueSelect } from '../../../handlebars-handlers/bonus-inputs/key-value-select.mjs';
import { textInput } from '../../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { api } from '../../../util/api.mjs';
import { difference } from '../../../util/array-intersects.mjs';
import { currentTargetedActors } from '../../../util/get-current-targets.mjs';
import { localize, localizeFluentDescription } from '../../../util/localize.mjs';
import { BaseConditionalTarget } from './_base-conditional.target.mjs';

const targetChoices =  /** @type {const} */ ({
    self: 'target-choice.self',
    target: 'target-choice.target',
});

/**
 * @typedef {keyof typeof targetChoices} TargetOptions
 */

/**
 * @extends {BaseConditionalTarget}
 */
export class HasBooleanFlagTarget extends BaseConditionalTarget {
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
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @returns {string}
     */
    static fluentDescription(source) {
        const key = this.#getTargetType(source) === 'self' ? 'has-boolean-flag-self' : 'has-boolean-flag-target';
        const flag = source.getFlag(MODULE_NAME, this.key);
        return localizeFluentDescription(key, { flag });
    }

    /**
     * @inheritdoc
     * @override
     */
    static init() {
        Hooks.once('ready', () =>
            // @ts-ignore
            Object.entries(targetChoices).forEach(([key, value]) => targetChoices[key] = localize(value))
        );
    }
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
     * @inheritdoc
     * @override
     * @param {ActorPF} actor
     * @param {ItemPF[]} sources
     * @returns {ItemPF[]}
     */
    static _filterToApplicableSources(actor, sources) {
        const currentTargets = currentTargetedActors();

        const filteredSources = sources.filter((source) => {
            const targetOrSelf = this.#getTargetType(source);
            const value = source.getFlag(MODULE_NAME, this.key);

            if (!value) {
                return false;
            }
            else if (targetOrSelf === 'self') {
                return actor.hasItemBooleanFlag(value);
            }
            else {
                return currentTargets.length
                    && currentTargets.every((a) => a.hasItemBooleanFlag(value));
            }
        });

        return filteredSources;
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {string} flag
     * @param {TargetOptions} [targetOrSelf]
     * @returns {Promise<void>}
     */
    static async configure(item, flag, targetOrSelf = 'target') {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: flag || '',
                    [this.#targetKey]: targetOrSelf,
                },
            },
        });
    }

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
                ...api.allSpecificBonusTypesKeys,
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
