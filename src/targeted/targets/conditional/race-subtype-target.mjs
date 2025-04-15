import { MODULE_NAME } from '../../../consts.mjs';
import { traitInput } from '../../../handlebars-handlers/trait-selector.mjs';
import { intersects } from '../../../util/array-intersects.mjs';
import { currentTargetedActors } from '../../../util/get-current-targets.mjs';
import { Trait } from '../../../util/trait-builder.mjs';
import { BaseTarget } from '../_base-target.mjs';

/**
 * @extends BaseTarget
 */
export class RaceSubtypeTarget extends BaseTarget {
    /**
     * @inheritdoc
     * @override
     */
    static get sourceKey() { return 'race-subtype'; }

    /**
     * @todo
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#race'; }

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
     * @param {ItemPF} source
     * @returns {Trait}
     */
    static #getRaceSubtypesTraits(source) {
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
        const subtypes = this.#getRaceSubtypesTraits(source);
        if (subtypes.names.length) {
            const hint = pf1.utils.i18n.join(subtypes.names, 'd', false);
            return [hint];
        }
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF & { actor: ActorPF }} item
     * @param {ItemPF[]} _sources
     * @returns {ItemPF[]}
     */
    static _getSourcesFor(item, _sources) {
        const { actor } = item;

        const currentTargets = currentTargetedActors();
        if (!currentTargets.length) return [];

        const flaggedSources = actor.itemFlags?.boolean[this.key]?.sources ?? [];
        const bonusSources = flaggedSources.filter((source) => {
            const subtypes = this.#getRaceSubtypesTraits(source);
            return currentTargets.every((a) => intersects(subtypes.total, a.race?.system.creatureSubtypes.total));
        });

        return bonusSources;
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
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'target',
        });
    }
}
