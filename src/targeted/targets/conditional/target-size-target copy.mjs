import { MODULE_NAME } from '../../../consts.mjs';
import { traitInput } from '../../../handlebars-handlers/trait-input.mjs';
import { intersects } from '../../../util/array-intersects.mjs';
import { currentTargetedActors } from '../../../util/get-current-targets.mjs';
import { localize, localizeFluentDescription } from '../../../util/localize.mjs';
import { toArray } from '../../../util/to-array.mjs';
import { Trait } from '../../../util/trait-builder.mjs';
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
}

/**
 * @extends BaseConditionalTarget
 */
export class TargetSizeTarget extends BaseConditionalTarget {
    /**
     * @inheritdoc
     * @override
     */
    static get sourceKey() { return 'size'; }

    /**
     * @todo
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#size'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @returns {string}
     */
    static fluentDescription(source) {
        const hints = this.getHints(source);
        return localizeFluentDescription(this, { size: hints?.[0] || '' });
    }

    /**
     * @inheritdoc
     * @override
     */
    static init() {
        Hooks.once('ready', () =>
            (/** @type {[ActorSize, string][]} */ (Object.entries(localizedSizes))).forEach(([key, value]) => localizedSizes[key] = localize(value))
        );
    }

    /**
     * @override
     * @inheritdoc
     */
    static get label() { return localize('PF1.Size'); }

    /**
     * @param {ItemPF} source
     * @returns {Trait}
     */
    static #getCreatureSizes(source) {
        const flag = source.getFlag(MODULE_NAME, this.key);
        const sizes = new Trait(localizedSizes, flag);
        return sizes;
    }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const creatureSizes = this.#getCreatureSizes(source);
        if (creatureSizes.names.length) {
            const hint = creatureSizes.namesOr;
            return [hint];
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
        const currentTargets = currentTargetedActors();
        if (!currentTargets.length) return [];

        const flaggedSources = sources;
        const bonusSources = flaggedSources.filter((source) => {
            const creatureSizes = this.#getCreatureSizes(source);
            return currentTargets.every((a) => {
                const size = Object.keys(pf1.config.sizeChart)[a.system.traits.size.value]
                return intersects(creatureSizes.total, size);
            });
        });

        return bonusSources;
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
        traitInput({
            choices: localizedSizes,
            item,
            journal: this.journal,
            key: this.key,
            label: this.label,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'target',
        });
    }
}
