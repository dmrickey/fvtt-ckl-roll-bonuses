import { MODULE_NAME } from "../../consts.mjs";
import { showTokenInput } from "../../handlebars-handlers/targeted/targets/token-input.mjs";
import { TokenSelectorApp } from "../../handlebars-handlers/targeted/targets/token-selector-app.mjs";
import { intersection, intersects } from "../../util/array-intersects.mjs";
import { truthiness } from "../../util/truthiness.mjs";
import { BaseTarget } from "./base-target.mjs";

export class TokenTarget extends BaseTarget {

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

    // todo show input on buff activation

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
        new TokenSelectorApp(item, { key: this.key }).render(true);
    }
}
