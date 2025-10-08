import { MODULE_NAME } from "../../../consts.mjs";
import { showEnabledLabel } from '../../../handlebars-handlers/enabled-label.mjs';
import { showActorInput } from '../../../handlebars-handlers/targeted/targets/actor-input.mjs';
import { isMelee } from '../../../util/action-type-helpers.mjs';
import { FlankHelper } from '../../../util/flank-helper.mjs';
import { currentTargets } from '../../../util/get-current-targets.mjs';
import { getTokenDisplayName } from '../../../util/get-token-display-name.mjs';
import { listFormat } from '../../../util/list-format.mjs';
import { localize, localizeBonusLabel, localizeBonusTooltip, localizeFluentDescription } from '../../../util/localize.mjs';
import { toArray } from '../../../util/to-array.mjs';
import { truthiness } from "../../../util/truthiness.mjs";
import { BaseConditionalTarget } from './_base-conditional.target.mjs';

/** @extends {BaseConditionalTarget} */
export class IsFlankingTarget extends BaseConditionalTarget {

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
            .filter((token) => uuids.includes(token.actor?.uuid ?? '-1'))
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
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @returns {string}
     */
    static fluentDescription(source) {
        const tokens = this.#potentialFlankTokens(source);
        let key;
        /** @type {string[]} */
        let names = [];
        if (tokens) {
            names = tokens.map((token) => getTokenDisplayName(token.document));
            names[0] ||= '???';
            key = 'is-flanking-with';
        }
        else {
            key = 'is-flanking';
        }
        return localizeFluentDescription(key, { ally: listFormat(names, 'or') });
    }

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
     * @inheritdoc
     * @override
     * @param {ActorPF} actor
     * @param {ItemPF[]} sources
     * @param {ItemPF | ActionUse | ItemAction | undefined} doc - originating doc event in case a specific action is needed
     * @returns {ItemPF[]}
     */
    static _filterToApplicableSources(actor, sources, doc) {
        if (!currentTargets().length) {
            return [];
        }

        let current = canvas.tokens.controlled.find((token) => token.actor?.uuid === actor.uuid);
        const self = current
            ? [current]
            : actor.getActiveTokens();

        const action = doc instanceof pf1.documents.item.ItemPF
            ? undefined
            : doc instanceof pf1.actionUse.ActionUse
                ? doc.action
                : doc;

        if (action && !isMelee(/** @type {ItemPF}*/ /** @type {any} */(null), action)) return [];

        const bonusSources = sources.filter((source) =>
            self.some((meToken) =>
                currentTargets().every((target) => {
                    const helper = new FlankHelper(meToken, target, { action, flankingWith: this.#potentialFlankTokens(source) });
                    return helper.isFlanking;
                })
            )
        );

        return bonusSources;
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
                [MODULE_NAME]: { [this.#withActorAlliesKey]: toArray(actorUuids) },
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
