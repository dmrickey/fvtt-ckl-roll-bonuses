import { MODULE_NAME } from '../../../consts.mjs';
import { showActorInput } from '../../../handlebars-handlers/targeted/targets/actor-input.mjs';
import { listFormat } from '../../../util/list-format.mjs';
import { localize } from '../../../util/localize.mjs';
import { PositionalHelper } from '../../../util/positional-helper.mjs';
import { truthiness } from '../../../util/truthiness.mjs';
import { BaseTarget } from '../_base-target.mjs';

export class WhileSharingSquareWithTarget extends BaseTarget {
    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'while-sharing-with'; }

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
            .filter((token) => uuids.includes(token.actor.uuid))
            .map((token) => token.object);
        return tokens || [];
    }

    /**
     * @override
     * @inheritdoc
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#while-sharing-square-with'; }

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
     * @override
     * @inheritdoc
     * @param {ItemPF & { actor: ActorPF }} item
     * @param {ItemPF[]} sources
     * @param {ItemPF | ActionUse | ItemAction} doc - originating doc event in case a specific action is needed
     * @returns {ItemPF[]}
     */
    static _getSourcesFor(item, sources, doc) {
        let token;
        if (doc instanceof pf1.documents.item.ItemPF) token = item.actor.getActiveTokens()[0];
        else if (doc instanceof pf1.components.ItemAction) token = item.actor.getActiveTokens()[0];
        else token = doc.token.object;

        if (token?.scene !== game.scenes.viewed) {
            return [];
        }

        const filtered = sources.filter((source) => {
            const allies = this.#allyTokens(source);
            return allies.every((ally) => new PositionalHelper(token, ally).isSharingSquare());
        })

        return filtered;
    }

    /**
     * @override
     * @inheritdoc
     */
    static get isConditionalTarget() { return true; }

    /**
     * @override
     * @inheritdoc
     * @returns {boolean}
     */
    static get isGenericTarget() { return true; }

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
