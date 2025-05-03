import { MODULE_NAME } from "../../../consts.mjs";
import { showEnabledLabel } from '../../../handlebars-handlers/enabled-label.mjs';
import { listFormat } from '../../../util/list-format.mjs';
import { localize } from '../../../util/localize.mjs';
import { PositionalHelper } from '../../../util/positional-helper.mjs';
import { truthiness } from "../../../util/truthiness.mjs";
import { BaseTarget } from "../_base-target.mjs";

export class IsFlankingTarget extends BaseTarget {

    static get #currentTargets() { return [...game.user.targets]; }

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'is-flanking'; }
    static get #withActorAlliesKey() { return `${this.key}-with`; }

    /**
     * @param {ItemPF} source
     * @returns {ActorPF[] | undefined}
     */
    static #potentialFlankActors(source) {
        /** @type {string[]} */
        const uuids = source.getFlag(MODULE_NAME, this.#withActorAlliesKey) ?? [];
        if (!uuids.length) {
            return;
        }

        const buddies = uuids
            .map((uuid) => /** @type {ActorPF} */(fromUuidSync(uuid)))
            .filter(truthiness);
        if (!buddies.length) {
            return;
        }

        return buddies;
    }

    /**
     * @param {ItemPF} source
     * @returns {TokenPF[] | undefined}
     */
    static #potentialFlankTokens(source) {
        /** @type {string[]} */
        const uuids = source.getFlag(MODULE_NAME, this.#withActorAlliesKey) ?? [];
        if (!uuids.length) {
            return;
        }

        const tokens = game.scenes.get(game.user.viewedScene)?.tokens.filter((token) => uuids.includes(token.actor.uuid));
        return tokens?.length ? tokens.map(t => t.object) : undefined;
    }

    /**
     * @override
     * @inheritdoc
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#is-flanking'; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const buddies = this.#potentialFlankActors(source);
        if (buddies) {
            return [localize('with ' + listFormat(buddies.map(x => x.name), 'or'))];
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
        if (!this.#currentTargets.length) {
            return [];
        }

        let current = canvas.tokens.controlled.find((token) => token.actor?.uuid === item.actor.uuid);
        const self = current
            ? [current]
            : item.actor.getActiveTokens();

        const action = doc instanceof pf1.documents.item.ItemPF
            ? undefined
            : doc instanceof pf1.actionUse.ActionUse
                ? doc.action
                : doc;

        const bonusSources = sources.filter((source) =>
            self.some((meToken) =>
                [...this.#currentTargets].every((target) => {
                    const helper = new PositionalHelper(meToken, target);
                    const isFlanking = helper.isFlanking({ action, flankingWith: this.#potentialFlankTokens(source) })
                    return isFlanking.length;
                })
            )
        );

        return bonusSources;
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

        showEnabledLabel({
            item,
            journal: this.journal,
            key: this.key,
            parent: html
        },
            {
                canEdit: isEditable,
                inputType: 'target',
            });
    }
}
