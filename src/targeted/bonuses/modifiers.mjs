import { MODULE_NAME } from "../../consts.mjs";
import { modifiersInput } from "../../handlebars-handlers/targeted/bonuses/modifiers.mjs";
import { localize } from "../../util/localize.mjs";
import { BaseBonus } from "./base-bonus.mjs";

/**
 * @extends BaseBonus
 */
export class ConditionalsBonus extends BaseBonus {
    /**
     * @inheritdoc
     * @override
     */
    static get type() { return 'modifiers'; }

    /**
     * @override
     * @param {object} options
     * @param {ActorPF | null} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ actor, item, html }) {
        modifiersInput({ item, key: this.key, parentElement: html });
    }

    /**
     * @override
     * @param {ActionUse} actionUse
     * @returns {any}
     */
    static getConditional({ actor, item, shared }) {
        /** @type {any[]} */
        const conditionals = [];
        if (!item.actor) return conditionals;

        const name = localize(this.key);

        const sources = item.actor.itemFlags.boolean[this.key]?.sources ?? [];
        sources.forEach((source) => {
            /** @type {RollData['action']['damage']['parts']} */
            const data = (source.getFlag(MODULE_NAME, this.key) || [])[0];
            const conditional = {
                ...data,
                ...data.data,
                modifiers: data.modifiers?.map((m) => ({ ...m.data }) ?? []),
            };
            if (conditional.modifiers.length) {
                conditionals.push(conditional);
            }
        });

        return conditionals;
    }
}
