import { conditionalsInput } from "../../handlebars-handlers/targeted/bonuses/conditionals.mjs";
import { BaseBonus } from "./base-bonus.mjs";

/**
 * @extends BaseBonus
 */
export class ConditionalsBonus extends BaseBonus {
    /**
     * @inheritdoc
     * @override
     */
    static get type() { return 'conditionals'; }

    /**
     * @override
     * @param {object} options
     * @param {ActorPF | null} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ actor, item, html }) {
        conditionalsInput({ item, key: this.key, parentElement: html });
    }
}
