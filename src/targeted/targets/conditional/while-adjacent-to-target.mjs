import { MODULE_NAME } from '../../../consts.mjs';
import { showActorInput } from '../../../handlebars-handlers/targeted/targets/actor-input.mjs';
import { listFormat } from '../../../util/list-format.mjs';
import { localize, localizeFluentDescription } from '../../../util/localize.mjs';
import { PositionalHelper } from '../../../util/positional-helper.mjs';
import { toArray } from '../../../util/to-array.mjs';
import { truthiness } from '../../../util/truthiness.mjs';
import { BaseConditionalTarget } from './_base-conditional.target.mjs';

/** @extends {BaseConditionalTarget} */
export class WhileAdjacentToTarget extends BaseConditionalTarget {
    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'while-adjacent-to'; }

    /**
     * @param {ItemPF} source
     * @returns {ActorPF[] | undefined}
     */
    static #withAllies(source) {
        /** @type {string[]} */
        const uuids = source.getFlag(MODULE_NAME, this.key) ?? [];
        const buddies = uuids
            .map((uuid) => /** @type {ActorPF} */(fromUuidSync(uuid)))
            .filter(truthiness);
        return buddies;
    }

    /**
     * Returns Tokens for configured allies within this scene
     * @param {ItemPF} source
     * @returns {TokenPF[]}
     */
    static #allyTokens(source) {
        /** @type {string[]} */
        const uuids = source.getFlag(MODULE_NAME, this.key) || [];
        const tokens = game.scenes.viewed?.tokens
            .filter((token) => uuids.includes(token.actor?.uuid ?? '-1'))
            .map((token) => token.object);
        return tokens || [];
    }

    /**
     * @override
     * @inheritdoc
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#while-adjacent-to'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @returns {string}
     */
    static fluentDescription(source) {
        const buddies = this.#withAllies(source);
        const names = listFormat(buddies?.map(x => x.name) || [], 'or');
        return localizeFluentDescription(this, { ally: names });
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const buddies = this.#withAllies(source);
        if (buddies) {
            return [`${localize('with')} ${listFormat(buddies.map(x => x.name), 'or')}`];
        }
    }

    /**
     * @inheritdoc
     * @override
     * @param {ActorPF} actor
     * @param {ItemPF[]} sources
     * @param {ItemPF | ActionUse | ItemAction | undefined} doc - originating doc event in case a specific action is needed
     * @returns {ItemPF[]}
     */
    static _filterToApplicableSources(actor, sources, doc) {
        const token = doc instanceof pf1.actionUse.ActionUse
            ? doc.token.object
            : actor.getActiveTokens()[0];

        if (token?.scene !== game.scenes.viewed) {
            return [];
        }

        const filtered = sources.filter((source) => {
            const allies = this.#allyTokens(source);
            return allies.some((ally) => new PositionalHelper(token, ally).isAdjacent());
        })

        return filtered;
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {ArrayOrSelf<string>} actorUuids
     * @returns {Promise<void>}
     */
    static async configure(item, actorUuids) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: toArray(actorUuids),
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
    static showInputOnItemSheet({ actor, html, isEditable, item }) {
        if (!actor) {
            return;
        }

        showActorInput({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
        }, {
            canEdit: isEditable,
        });
    }
}
