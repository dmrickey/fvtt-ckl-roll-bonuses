import { MODULE_NAME } from '../../../consts.mjs';
import { radioInput } from '../../../handlebars-handlers/bonus-inputs/radio-input.mjs';
import { traitInput } from '../../../handlebars-handlers/trait-input.mjs';
import { currentTargetedActors } from '../../../util/get-current-targets.mjs';
import { listFormat } from '../../../util/list-format.mjs';
import { localize, localizeFluentDescription } from '../../../util/localize.mjs';
import { truthiness } from '../../../util/truthiness.mjs';
import { BaseConditionalTarget } from './_base-conditional.target.mjs';

const targetChoices =  /** @type {const} */ ({
    self: 'target-choice.self',
    target: 'target-choice.target',
});

/**
 * @typedef {'self' | 'target'} TargetOption
*/

/** @type {Record<TargetOption, string>} */
const labeledChoices = {
    self: '',
    target: '',
};

const all = 'all';
const any = 'any';

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
    static get #anyOrAllKey() { return `${this.key}-any-or-all`; }

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
        const conditions = this.#getConditionsAslListText(source);
        if (!conditions) return '';
        return localizeFluentDescription(key, { conditions });
    }

    /**
     * @inheritdoc
     * @override
     */
    static init() {
        Hooks.once('ready', () =>
            (/** @type {[TargetOption, string][]} */ (Object.entries(targetChoices))).forEach(([key, value]) => labeledChoices[key] = localize(value))
        );
    }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const conditions = this.#getConditionsFromItem(source);
        const targetOrSelf = this.#getTargetType(source);
        if (conditions.length) {
            const conditionsText = this.#getConditionsAslListText(source);
            if (conditionsText) {
                return [`${labeledChoices[targetOrSelf]}: ${conditionsText}`];
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
            const conditions = this.#getConditionsFromItem(source);
            if (!conditions.length) return false;

            const targetOrSelf = this.#getTargetType(source);
            const everyOrSome = source.getFlag(MODULE_NAME, this.#anyOrAllKey) === all ? 'every' : 'some';
            if (targetOrSelf === 'self') {
                return conditions[everyOrSome]((condition) => actor.statuses.has(condition));
            }
            else {
                if (!currentTargets.length) return false;
                return currentTargets.every((a) => conditions[everyOrSome]((condition) => a.statuses.has(condition)));
            }
        });

        return bonusSources;
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {keyof Conditions} condition
     * @param {TargetOption} [targetOrSelf]
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

    /** @type {Record<string, string>?} */
    static #labeledConditions = null;
    /** @returns {Record<string, string>} */
    static get #getLabeledConditions() {
        return this.#labeledConditions ||= pf1.registry.conditions.contents
            .map(({ id, name }) => ({ key: id, label: name }))
            .sort((a, b) => a.label.localeCompare(b.label))
            .reduce((acc, { key, label }) => ({ ...acc, [key]: label }), {});
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
            choices: this.#getLabeledConditions,
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'target',
        });

        radioInput({
            item,
            journal: this.journal,
            key: this.#targetKey,
            parent: html,
            tooltip: this.tooltip,
            values: Object.entries(labeledChoices).map(([key, label]) => ({ id: key, label })),
        }, {
            canEdit: isEditable,
            inputType: 'target',
            isSubLabel: true,
        });

        const current = this.#getConditionsFromItem(item);
        if (current.length > 1) {
            const radioValues = [
                { id: all, label: localize(`target-toggle.${all}`) },
                { id: any, label: localize(`target-toggle.${any}`) },
            ];

            radioInput({
                item,
                journal: this.journal,
                key: this.#anyOrAllKey,
                values: radioValues,
                parent: html,
            }, {
                canEdit: isEditable,
                inputType: 'target',
                isSubLabel: true,
            });
        }
    }

    /**
     * @param {ItemPF} source
     * @returns {TargetOption}
     */
    static #getTargetType(source) {
        return source.getFlag(MODULE_NAME, this.#targetKey) || 'target';
    }

    /**
     * @param {ItemPF} source
     * @returns {(keyof Conditions)[]}
     */
    static #getConditionsFromItem(source) {
        return source.getFlag(MODULE_NAME, this.key) || [];
    }

    /**
     * @param {ItemPF} source
     * @returns {string}
     */
    static #getConditionsAslListText(source) {
        const conditions = this.#getConditionsFromItem(source)
            .map((c) => pf1.registry.conditions.get(c)?.name ?? '')
            .filter(truthiness);
        if (!conditions.length) return '';

        const join = source.getFlag(MODULE_NAME, this.#anyOrAllKey) === all ? 'and' : 'or';
        const text = listFormat(conditions, join);
        return text;
    }
}
