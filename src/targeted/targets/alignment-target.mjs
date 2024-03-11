import { MODULE_NAME } from "../../consts.mjs";
import { keyValueSelect } from '../../handlebars-handlers/bonus-inputs/key-value-select.mjs';
import { truthiness } from '../../util/truthiness.mjs';
import { BaseTarget } from "./base-target.mjs";

// /** @type {Record<string, string>} */
const choices =  /** @type {const} */ ({
    lawful: pf1.config.damageResistances.lawful,
    chaotic: pf1.config.damageResistances.chaotic,
    good: pf1.config.damageResistances.good,
    evil: pf1.config.damageResistances.evil,
});

/**
 * @typedef {keyof typeof choices} AlignmentOptions
 */

/**
 * @augments BaseTarget
 */
export class AlignmentTarget extends BaseTarget {
    /**
     * @inheritdoc
     * @override
     */
    static get targetKey() { return 'alignment'; }

    /** @type {ActorPF[]} */
    static get #currentTargetedActors() {
        return [...game.user.targets]
            .map(x => x.actor)
            .filter(truthiness);
    }

    /**
     *
     * @param {ItemPF} item
     * @returns {string}
     */
    static #getFlagLetter(item) {
        /** @type {AlignmentOptions} */
        const current = item.getFlag(MODULE_NAME, this.key);
        switch (current) {
            case 'chaotic': return 'c';
            case 'evil': return 'e';
            case 'good': return 'g';
            case 'lawful': return 'l';
            default: return '';
        }
    }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        /** @type {AlignmentOptions} */
        const alignment = source.getFlag(MODULE_NAME, this.key);
        if (alignment) {
            return [choices[alignment]];
        }
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF | ActionUse | ItemAction} doc
     * @returns {ItemPF[]}
     */
    static getBonusSourcesForTarget(doc) {
        if (!this.#currentTargetedActors.length) {
            return [];
        }

        const item = doc instanceof pf1.documents.item.ItemPF
            ? doc
            : doc.item;
        if (!item.uuid || !item.actor) {
            return [];
        }

        const flaggedSources = item.actor.itemFlags.boolean[this.key]?.sources ?? [];
        const bonusSources = flaggedSources.filter((source) => {
            const bonusAlignment = this.#getFlagLetter(source);
            return !this.#currentTargetedActors.some((actor) => actor.system.details.alignment?.includes(bonusAlignment));
        });

        return bonusSources;
    }

    /**
     * @inheritdoc
     * @override
     * @param {object} options
     * @param {ActorPF | null | undefined} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ actor, item, html }) {

        keyValueSelect({
            choices,
            item,
            key: this.key,
            label: this.label,
            parent: html,
        });
    }
}
