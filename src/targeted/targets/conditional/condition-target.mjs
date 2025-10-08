import { MODULE_NAME } from '../../../consts.mjs';
import { keyValueSelect } from '../../../handlebars-handlers/bonus-inputs/key-value-select.mjs';
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
 * @extends BaseConditionalTarget
 */
export class ConditionTarget extends BaseConditionalTarget {
    /**
     * @inheritdoc
     * @override
     */
    static get sourceKey() { return 'condition'; }
    static get #targetKey() { return `${this.key}-target`; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#has-condition'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @returns {string}
     */
    static fluentDescription(source) {
        const key = this.#getTargetType(source) === 'self' ? 'condition-self' : 'condition-target';
        const condition = source.getFlag(MODULE_NAME, this.key);
        return localizeFluentDescription(key, { condition: condition ? pf1.registry.conditions.get(condition)?.name : '' });
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
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const condition = source.getFlag(MODULE_NAME, this.key);
        const targetOrSelf = this.#getTargetType(source);
        if (condition) {
            const name = pf1.registry.conditions.get(condition)?.name;
            if (name) {
                return [`${name} - ${targetChoices[targetOrSelf]}`];
            }
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

        const bonusSources = sources.filter((source) => {
            const condition = source.getFlag(MODULE_NAME, this.key);
            if (!condition) return false;

            const targetOrSelf = this.#getTargetType(source);
            if (targetOrSelf === 'self') {
                return actor.statuses.has(condition);
            }
            else {
                if (!currentTargets.length) return false;
                return currentTargets.every((a) => a.statuses.has(condition));
            }
        });

        return bonusSources;
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {keyof Conditions} condition
     * @param {TargetOptions} [targetOrSelf]
     * @returns {Promise<void>}
     */
    static async configure(item, condition, targetOrSelf = 'target') {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: condition || '',
                    [this.#targetKey]: targetOrSelf,
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
        const choices = pf1.registry.conditions.contents
            .map(({ id, name }) => ({ key: id, label: name }));
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
        return source.getFlag(MODULE_NAME, this.#targetKey) || 'target';
    }
}
