import { MODULE_NAME } from "../../consts.mjs";
import { showTokenInput } from "../../handlebars-handlers/targeted/targets/token-input.mjs";
import { TokenSelectorApp } from "../../handlebars-handlers/targeted/targets/token-selector-app.mjs";
import { intersection, intersects } from "../../util/array-intersects.mjs";
import { registerSetting } from "../../util/settings.mjs";
import { truthiness } from "../../util/truthiness.mjs";
import { BaseTarget } from "./base-target.mjs";

class Settings {
    static tokenSettingKey = 'should-auto-target-tokens';
    static get shouldAutoTarget() { return Settings.#getSetting(this.tokenSettingKey); }
    // @ts-ignore
    static #getSetting(/** @type {string} */key) { return game.settings.get(MODULE_NAME, key); }

    static init() {
        registerSetting({
            key: this.tokenSettingKey,
            scope: 'client',
            settingType: Boolean,
        });
    }
}

export class TokenTarget extends BaseTarget {

    /**
     * @override
     */
    static initSettings() {
        Settings.init();
    }

    static get #currentTargetUuids() { return [...game.user.targets].map(x => x.document?.uuid).filter(truthiness); }

    /**
     * @override
     */
    static get type() { return 'token'; }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        /** @type {string[]} */
        const savedTargets = source.getFlag(MODULE_NAME, this.key) ?? [];
        const targets = intersection(savedTargets, this.#currentTargetUuids);
        return targets.map((target) => fromUuidSync(target)?.name).filter(truthiness);
    }

    /**
     * @override
     * @param {ItemPF | ActionUse | ItemAction} doc
     * @returns {ItemPF[]}
     */
    static getBonusSourcesForTarget(doc) {
        if (!this.#currentTargetUuids.length) {
            return [];
        }

        const item = doc instanceof pf1.documents.item.ItemPF
            ? doc
            : doc.item;
        if (!item.uuid || !item.actor) {
            return [];
        }

        // fromUuidSync
        const flaggedItems = item.actor.itemFlags.boolean[this.key]?.sources ?? [];
        const bonusSources = flaggedItems.filter((flagged) => {
            /** @type {string[]} */
            const savedTargets = flagged.getFlag(MODULE_NAME, this.key) ?? [];
            return intersects(this.#currentTargetUuids, savedTargets);
        });

        return bonusSources;
    }

    /**
     * @override
     * @returns {boolean}
     */
    static get isGenericTarget() { return true; }

    /**
     * @override
     * @param {object} options
     * @param {ActorPF | null | undefined} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ actor, item, html }) {
        if (!actor) {
            return;
        }

        showTokenInput({
            item,
            key: this.key,
            parent: html,
            label: this.label,
        });
    }

    /**
     * @override
     * @returns {boolean}
     */
    static get showOnActive() { return true; }

    /**
     * @override
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
