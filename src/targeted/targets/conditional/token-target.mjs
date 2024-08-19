import { MODULE_NAME } from "../../../consts.mjs";
import { checkboxInput } from '../../../handlebars-handlers/bonus-inputs/chekbox-input.mjs';
import { showTokenInput } from "../../../handlebars-handlers/targeted/targets/token-input.mjs";
import { TokenSelectorApp } from "../../../handlebars-handlers/targeted/targets/token-selector-app.mjs";
import { difference, intersection, intersects } from "../../../util/array-intersects.mjs";
import { localize } from '../../../util/localize.mjs';
import { registerSetting } from "../../../util/settings.mjs";
import { truthiness } from "../../../util/truthiness.mjs";
import { BaseTarget } from "../base-target.mjs";

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

export class TokenTarget extends BaseTarget {

    static get #currentTargetUuids() { return [...game.user.targets].map(x => x.document?.uuid).filter(truthiness); }

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
     * @override
     * @inheritdoc
     * @param {ItemPF & { actor: ActorPF }} _item
     * @param {ItemPF[]} sources
     * @returns {ItemPF[]}
     */
    static _getSourcesFor(_item, sources) {
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
            const currentTargetUuids = [...game.user.targets].map(x => x.document.uuid);
            if (currentTargetUuids.length) {
                item.setFlag(MODULE_NAME, this.key, currentTargetUuids);
                return;
            }
        }
        new TokenSelectorApp(item, { key: this.key }).render(true);
    }
}
