import { MODULE_NAME } from '../../../consts.mjs';
import { traitInput } from '../../../handlebars-handlers/trait-selector.mjs';
import { intersects } from '../../../util/array-intersects.mjs';
import { currentTargetedActors } from '../../../util/get-current-targets.mjs';
import { localize } from '../../../util/localize.mjs';
import { Trait } from '../../../util/trait-builder.mjs';
import { BaseTarget } from '../_base-target.mjs';

/**
 * @extends BaseTarget
 */
export class RaceTarget extends BaseTarget {
    /**
     * @inheritdoc
     * @override
     */
    static get sourceKey() { return 'race'; }

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
    static get label() { return localize('PF1.Race'); }

    /**
     * @override
     * @inheritdoc
     */
    static get isGenericTarget() { return true; }

    /**
     * @param {ItemPF} source
     * @returns {Trait}
     */
    static #getRaceTraits(source) {
        const choices = pf1.config.creatureTypes;
        const flag = source.getFlag(MODULE_NAME, this.key);
        const races = new Trait(choices, flag);
        return races;
    }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const races = this.#getRaceTraits(source);
        if (races.names.length) {
            const hint = pf1.utils.i18n.join(races.names, 'd', false);
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

        const flaggedSources = actor.itemFlags?.boolean[this.key]?.sources ?? [];
        const bonusSources = flaggedSources.filter((source) => {
            const races = this.#getRaceTraits(source);
            return currentTargets.every((a) => intersects(races.total, a.race?.creatureTypes.total));
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
