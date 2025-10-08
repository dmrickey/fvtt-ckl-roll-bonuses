import { MODULE_NAME } from '../../../consts.mjs';
import { traitInput } from '../../../handlebars-handlers/trait-input.mjs';
import { intersects } from '../../../util/array-intersects.mjs';
import { currentTargetedActors } from '../../../util/get-current-targets.mjs';
import { listFormat } from '../../../util/list-format.mjs';
import { localize, localizeFluentDescription } from '../../../util/localize.mjs';
import { toArray } from '../../../util/to-array.mjs';
import { Trait } from '../../../util/trait-builder.mjs';
import { BaseConditionalTarget } from './_base-conditional.target.mjs';

/**
 * @extends BaseConditionalTarget
 */
export class CreatureSubtypeTarget extends BaseConditionalTarget {
    /**
     * @inheritdoc
     * @override
     */
    static get sourceKey() { return 'creature-subtype'; }

    /**
     * @todo
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#creature-type'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @returns {string}
     */
    static fluentDescription(source) {
        const hints = this.getHints(source);
        return localizeFluentDescription(this, { subtype: hints?.[0] || '' });
    }

    /**
     * @override
     * @inheritdoc
     */
    static get label() { return localize('PF1.CreatureSubTypes.Single'); }

    /**
     * @param {ItemPF} source
     * @returns {Trait}
     */
    static #getCreatureSubtypesTraits(source) {
        const choices = pf1.config.creatureSubtypes;
        const flag = source.getFlag(MODULE_NAME, this.key);
        const subtypes = new Trait(choices, flag);
        return subtypes;
    }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const subtypes = this.#getCreatureSubtypesTraits(source);
        if (subtypes.names.length) {
            const hint = listFormat(subtypes.names, 'or');
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

        const bonusSources = sources.filter((source) => {
            const subtypes = this.#getCreatureSubtypesTraits(source);
            return currentTargets.every((a) => intersects(subtypes.total, a.race?.system.creatureSubtypes.total));
        });

        return bonusSources;
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {ArrayOrSelf<CreatureSubtype>} creatureSubtypes
     * @returns {Promise<void>}
     */
    static async configure(item, creatureSubtypes) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: toArray(creatureSubtypes),
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
        const choices = pf1.config.creatureSubtypes;
        traitInput({
            choices,
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
