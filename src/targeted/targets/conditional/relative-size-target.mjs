import { MODULE_NAME } from '../../../consts.mjs';
import { radioInput } from '../../../handlebars-handlers/bonus-inputs/radio-input.mjs';
import { showLabel } from '../../../handlebars-handlers/bonus-inputs/show-label.mjs';
import { textInput } from '../../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { traitInput } from '../../../handlebars-handlers/trait-input.mjs';
import { intersects } from '../../../util/array-intersects.mjs';
import { FormulaCacheHelper } from '../../../util/flag-helpers.mjs';
import { currentTargetedActors } from '../../../util/get-current-targets.mjs';
import { listFormat } from '../../../util/list-format.mjs';
import { localize, localizeBonusLabel, localizeBonusTooltip, localizeFluentDescription } from '../../../util/localize.mjs';
import { simplify } from '../../../util/simplify-roll-formula.mjs';
import { toArray } from '../../../util/to-array.mjs';
import { Trait } from '../../../util/trait-builder.mjs';
import { truthiness } from '../../../util/truthiness.mjs';
import { BaseConditionalTarget } from './_base-conditional.target.mjs';

/** @type {Record<ActorSize, string>} */
const localizedSizes = {
    'fine': 'PF1.ActorSize.fine',
    'dim': 'PF1.ActorSize.dim',
    'tiny': 'PF1.ActorSize.tiny',
    'sm': 'PF1.ActorSize.sm',
    'med': 'PF1.ActorSize.med',
    'lg': 'PF1.ActorSize.lg',
    'huge': 'PF1.ActorSize.huge',
    'grg': 'PF1.ActorSize.grg',
    'col': 'PF1.ActorSize.col',
};

const specificityChoices = {
    smallerThan: 'size-choice.smaller-than',
    exactly: 'size-choice.exactly',
    largerThan: 'size-choice.larger-than',
};

const directionChoices = {
    larger: 'size-choice.larger',
    smaller: 'size-choice.smaller',
};

/**
 * @extends BaseConditionalTarget
 */
export class RelativeSizeTarget extends BaseConditionalTarget {
    /**
     * @inheritdoc
     * @override
     */
    static get sourceKey() { return 'relative-size'; }

    static get #diffKey() { return `${this.key}-diff`; }
    static get #specificityKey() { return `${this.key}-specificty`; }
    static get #directionKey() { return `${this.key}-direction`; }

    /**
     * @todo
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#relative-size'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @returns {string}
     */
    static fluentDescription(source) {
        const diff = FormulaCacheHelper.getModuleFlagValue(source, this.#diffKey);
        const specificity = /** @type {keyof typeof specificityChoices} */ (source.getFlag(MODULE_NAME, this.#specificityKey));
        const direction = /** @type {keyof typeof directionChoices} */ (source.getFlag(MODULE_NAME, this.#directionKey));

        if (specificity && direction && diff >= 0) {
            const i18nKey = diff === 0
                ? 'relative-size-description.equal'
                : diff === 1
                    ? 'relative-size-description.single'
                    : 'relative-size-description.plural';

            const label = localize(
                i18nKey,
                {
                    specific: specificityChoices[specificity],
                    direction: directionChoices[direction],
                    diff,
                },
            );
            return label;
        }

        return '';
    }

    /**
     * @inheritdoc
     * @override
     */
    static init() {
        Hooks.once('ready', () => {
            (/** @type {[ActorSize, string][]} */ (Object.entries(localizedSizes))).forEach(([key, value]) => localizedSizes[key] = localize(value));
            (/** @type {[keyof typeof specificityChoices, string][]} */ (Object.entries(specificityChoices))).forEach(([key, value]) => specificityChoices[key] = localize(value));
            (/** @type {[keyof typeof directionChoices, string][]} */ (Object.entries(directionChoices))).forEach(([key, value]) => directionChoices[key] = localize(value));
        });

        FormulaCacheHelper.registerModuleFlag(this.#diffKey);
    }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const actor = source.actor;
        if (!actor) return [];

        const actorSizeKey = /** @type {ActorSize} */ (Object.keys(pf1.config.sizeChart)[actor.system.traits.size.value]);
        const actorSize = localizedSizes[actorSizeKey];
        const sizeKeys = this.#getTargetSizes(source);
        const targetSizes = listFormat(sizeKeys.map((k) => localizedSizes[k]), 'or');
        const hint = localize('relative-size-description.preview', { actorSize, targetSizes });
        return [hint];
    }

    /**
     * @inheritdoc
     * @override
     * @param {ActorPF} _actor
     * @param {ItemPF[]} sources
     * @returns {ItemPF[]}
     */
    static _filterToApplicableSources(_actor, sources) {
        const currentTargets = currentTargetedActors();
        if (!currentTargets.length) return [];

        const bonusSources = sources.filter((source) => {
            const creatureSizes = this.#getTargetSizes(source);
            return currentTargets.every((a) => {
                const size = Object.keys(pf1.config.sizeChart)[a.system.traits.size.value]
                return intersects(creatureSizes, size);
            });
        });

        return bonusSources;
    }

    /**
     * @param {ItemPF} source 
     * @return {ActorSize[] }
     */
    static #getTargetSizes(source) {
        const actor = source.actor;
        if (!actor) return [];

        const specificity = /** @type {keyof typeof specificityChoices} */ (source.getFlag(MODULE_NAME, this.#specificityKey));
        const diff = FormulaCacheHelper.getModuleFlagValue(source, this.#diffKey);
        const direction = /** @type {keyof typeof directionChoices} */ (source.getFlag(MODULE_NAME, this.#directionKey));

        const actorSizeIndex = actor.system.traits.size.value;

        let startingIndex = actorSizeIndex;
        switch (direction) {
            case 'smaller': startingIndex -= diff; break;
            case 'larger': startingIndex += diff; break;
        }

        const actorSizes = /** @type {ActorSize[]} */ (Object.keys(pf1.config.sizeChart));

        switch (specificity) {
            case 'smallerThan': return actorSizes.slice(0, startingIndex);
            case 'largerThan': return actorSizes.slice(startingIndex + 1);
            case 'exactly': return [actorSizes[startingIndex]].filter(truthiness);
            default: return [];
        }
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {ArrayOrSelf<ActorSize>} sizes
     * @returns {Promise<void>}
     */
    static async configure(item, sizes) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: toArray(sizes),
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
        showLabel({
            item,
            journal: this.journal,
            key: this.key,
            label: this.label,
            parent: html,
            tooltip: this.tooltip,
        }, {
            inputType: 'target',
        });

        radioInput({
            item,
            journal: this.journal,
            key: this.#specificityKey,
            label: localizeBonusLabel(this.#specificityKey),
            tooltip: localizeBonusTooltip(this.#specificityKey),
            parent: html,
            values: Object.entries(specificityChoices).map(([key, value]) => ({ id: key, label: value })),
        }, {
            canEdit: isEditable,
            inputType: 'target',
            isSubLabel: true,
        });
        textInput({
            item,
            journal: this.journal,
            key: this.#diffKey,
            label: localizeBonusLabel(this.#diffKey),
            tooltip: localizeBonusTooltip(this.#diffKey),
            parent: html,
        }, {
            canEdit: isEditable,
            inputType: 'target',
            isSubLabel: true,
        });
        radioInput({
            item,
            journal: this.journal,
            key: this.#directionKey,
            label: localizeBonusLabel(this.#directionKey),
            tooltip: localizeBonusTooltip(this.#directionKey),
            parent: html,
            values: Object.entries(directionChoices).map(([key, value]) => ({ id: key, label: value })),
        }, {
            canEdit: isEditable,
            inputType: 'target',
            isSubLabel: true,
        });

        const fluent = this.fluentDescription(item);
        if (fluent) {
            showLabel({
                item,
                label: fluent,
                parent: html,
            }, {
                inputType: 'target',
                isSubLabel: true,
                extraClasses: 'ta-c',
            });

            const hint = this.getHints(item)?.[0];
            if (hint) {
                showLabel({
                    item,
                    label: hint,
                    parent: html,
                }, {
                    inputType: 'target',
                    isSubLabel: true,
                    extraClasses: 'ta-c fs-i',
                });
            }
        }
    }
}
