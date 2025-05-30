import { MODULE_NAME } from "../../../consts.mjs";
import { showEnabledLabel } from '../../../handlebars-handlers/enabled-label.mjs';
import { showActorInput } from '../../../handlebars-handlers/targeted/targets/actor-input.mjs';
import { isMelee } from '../../../util/action-type-helpers.mjs';
import { FlankHelper } from '../../../util/flank-helper.mjs';
import { listFormat } from '../../../util/list-format.mjs';
import { localize, localizeBonusLabel, localizeBonusTooltip } from '../../../util/localize.mjs';
import { toArray } from '../../../util/to-array.mjs';
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
     * Returns nothing if no allies are configured, otherwise it returns all tokens for configured allies within this scene
     * @param {ItemPF} source
     * @returns {TokenPF[] | undefined}
     */
    static #potentialFlankTokens(source) {
        /** @type {string[]} */
        const uuids = source.getFlag(MODULE_NAME, this.#withActorAlliesKey) ?? [];
        if (!uuids.length) {
            return;
        }

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

        if (!isMelee(item, action)) return [];

        const bonusSources = sources.filter((source) =>
            self.some((meToken) =>
                [...this.#currentTargets].every((target) => {
                    const helper = new FlankHelper(meToken, target, { action, flankingWith: this.#potentialFlankTokens(source) });
                    return helper.isFlanking;
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
                [MODULE_NAME]: { [this.#withActorAlliesKey]: toArray(actorUuids || []) },
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

        showActorInput({
            item,
            journal: this.journal,
            key: this.#withActorAlliesKey,
            label: localizeBonusLabel(this.#withActorAlliesKey),
            parent: html,
            tooltip: localizeBonusTooltip(this.#withActorAlliesKey),
        }, {
            canEdit: isEditable,
            isSubLabel: true,
        });
    }
}
