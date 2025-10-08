import { MODULE_NAME } from "../../../consts.mjs";
import { checkboxInput } from '../../../handlebars-handlers/bonus-inputs/chekbox-input.mjs';
import { showTokenInput } from "../../../handlebars-handlers/targeted/targets/token-input.mjs";
import { TokenSelectorApp } from "../../../handlebars-handlers/targeted/targets/token-select-app.mjs";
import { difference, intersection, intersects } from "../../../util/array-intersects.mjs";
import { currentTargets } from '../../../util/get-current-targets.mjs';
import { getTokenDisplayName } from '../../../util/get-token-display-name.mjs';
import { listFormat } from '../../../util/list-format.mjs';
import { localize, localizeFluentDescription } from '../../../util/localize.mjs';
import { registerSetting } from "../../../util/settings.mjs";
import { toArray } from '../../../util/to-array.mjs';
import { truthiness } from "../../../util/truthiness.mjs";
import { BaseConditionalTarget } from './_base-conditional.target.mjs';

class Settings {
    static get #tokenSettingKey() { return 'should-auto-target-tokens'; }
    static get shouldAutoTarget() { return Settings.#getSetting(this.#tokenSettingKey); }
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key); }

    static {
        registerSetting({
            key: this.#tokenSettingKey,
            scope: 'client',
            settingType: Boolean,
            defaultValue: false,
        });
    }
}

/** @extends {BaseConditionalTarget} */
export class TokenTarget extends BaseConditionalTarget {

    static get #currentTargetUuids() { return currentTargets().map(x => x.document?.uuid).filter(truthiness); }

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'token'; }
    static get #inversionKey() { return `${this.key}-invert`; }

    /**
     * @override
     * @inheritdoc
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.IpRhJqZEX2TUarSX#token'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} source
     * @returns {string}
     */
    static fluentDescription(source) {
        /** @type {string[]} */
        const savedTargets = source.getFlag(MODULE_NAME, this.key) ?? [];
        const names = savedTargets
            .map((uuid) => fromUuidSync(uuid))
            .filter(truthiness)
            .map((token) => getTokenDisplayName(token));

        const key = !!source.getFlag(MODULE_NAME, this.#inversionKey) ? 'token-inverted' : 'token';

        return localizeFluentDescription(key, { token: listFormat(names, 'or') });
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        /** @type {string[]} */
        const savedTargets = source.getFlag(MODULE_NAME, this.key) ?? [];
        if (!savedTargets.length) {
            return;
        }

        const isInverted = !!source.getFlag(MODULE_NAME, this.#inversionKey);

        if (isInverted) {
            return [
                localize('any-target-except'),
                ...savedTargets.map((uuid) => fromUuidSync(uuid)?.name)
            ].filter(truthiness);
        } {
            const targets = intersection(savedTargets, this.#currentTargetUuids);
            return targets.map((target) => fromUuidSync(target)?.name).filter(truthiness);
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
        if (!this.#currentTargetUuids.length) {
            return [];
        }

        const bonusSources = sources.filter((source) => {
            /** @type {string[]} */
            const savedTargets = source.getFlag(MODULE_NAME, this.key) ?? [];
            const isInverted = !!source.getFlag(MODULE_NAME, this.#inversionKey);
            return isInverted
                ? difference(this.#currentTargetUuids, savedTargets).length
                : intersects(this.#currentTargetUuids, savedTargets);
        });

        return bonusSources;
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {object} options
     * @param {boolean} [options.inverted]
     * @param {ArrayOrSelf<string>} [options.tokenUuids]
     * @returns {Promise<void>}
     */
    static async configure(item, { inverted, tokenUuids }) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.#inversionKey]: !!inverted,
                    [this.key]: toArray(tokenUuids),
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

        showTokenInput({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
        });
        checkboxInput({
            item,
            journal: this.journal,
            key: this.#inversionKey,
            parent: html,
        }, {
            canEdit: isEditable,
            inputType: 'target',
            isSubLabel: true,
        });
    }

    /**
     * @override
     * @inheritdoc
     * @returns {boolean}
     */
    static get showOnActive() { return true; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} item
     */
    static showTargetEditor(item) {
        if (Settings.shouldAutoTarget) {
            const currentTargetUuids = currentTargets().map(x => x.document.uuid);
            if (currentTargetUuids.length) {
                item.setFlag(MODULE_NAME, this.key, currentTargetUuids);
                return;
            }
        }
        new TokenSelectorApp(item, { key: this.key }).render(true);
    }
}
