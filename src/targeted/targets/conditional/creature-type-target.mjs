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
export class CreatureTypeTarget extends BaseConditionalTarget {
    /**
     * @inheritdoc
     * @override
     */
    static get sourceKey() { return 'creature-type'; }

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
        return localizeFluentDescription(this, { type: hints?.[0] || '' });
    }

    /**
     * @override
     * @inheritdoc
     */
    static get label() { return localize('PF1.CreatureType'); }

    /**
     * @param {ItemPF} source
     * @returns {Trait}
     */
    static #getCreatureTypes(source) {
        const choices = pf1.config.creatureTypes;
        const flag = source.getFlag(MODULE_NAME, this.key);
        const types = new Trait(choices, flag);
        return types;
    }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const creatureTypes = this.#getCreatureTypes(source);
        if (creatureTypes.names.length) {
            const hint = listFormat(creatureTypes.names, 'or');
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
            const creatureTypes = this.#getCreatureTypes(source);
            return currentTargets.every((a) => intersects(creatureTypes.total, a.race?.system.creatureTypes.total));
        });

        return bonusSources;
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {ArrayOrSelf<CreatureType>} creatureTypes
     * @returns {Promise<void>}
     */
    static async configure(item, creatureTypes) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: toArray(creatureTypes),
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
        const choices = pf1.config.creatureTypes;
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
