import { MODULE_NAME } from "../../consts.mjs";
import { modifiersInput } from "../../handlebars-handlers/targeted/bonuses/modifiers.mjs";
import { localize } from "../../util/localize.mjs";
import { BaseBonus } from "./base-bonus.mjs";

/**
 * @extends BaseBonus
 */
export class ModifiersBonus extends BaseBonus {
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
     * @param {ItemPF} target
     * @returns {any}
     */
    static getConditional(target) {
        /** @type {any[]} */
        const conditionals = [];

        const name = localize(this.key);

        /** @type {ItemConditional} */
        const data = (target.getFlag(MODULE_NAME, this.key) || [])[0];

        if (data) {
            const conditional = {
                ...data,
                ...data.data,
                modifiers: data.modifiers?.map((m) => ({ ...m.data }) ?? []),
            };
            if (conditional.modifiers.length) {
                conditionals.push(conditional);
            }
        }

        return conditionals;
    }
}
