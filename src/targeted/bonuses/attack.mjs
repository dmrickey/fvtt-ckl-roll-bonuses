import { MODULE_NAME } from "../../consts.mjs";
import { textInput } from "../../handlebars-handlers/bonus-inputs/text-input.mjs";
import { BaseBonus } from "./base-bonus.mjs";

/**
 * @extends BaseBonus
 */
export class AttackBonus extends BaseBonus {
    /**
     * @inheritdoc
     * @override
     */
    static get type() { return 'attack'; }

    /**
     * @override
     * @param {object} o
     * @param {ActorPF} o.actor,
     * @param {typeof Hint} o.hintcls,
     * @param {ItemPF} o.item,
     */
    static registerHintOnBonus({ actor, hintcls, item }) {
        // todo
    }

    /**
     * @override
     * @param {object} o
     * @param {ActorPF} o.actor,
     * @param {typeof Hint} o.hintcls,
     * @param {ItemPF} o.item,
     */
    static registerHintOnTarget({ actor, hintcls, item }) {
        // todo
    }

    /**
     * @override
     * @param {ItemPF} target
     * @returns {ModifierSource[]}
     */
    static getAttackSourcesForTooltip(target) {
        const formula = target.getFlag(MODULE_NAME, this.key);
        const value = RollPF.safeTotal(formula, target.actor.getRollData());
        return [{
            value,
            name: target.name,
            modifier: 'untyped',
            sort: -100,
        }];
    }

    /**
     * @override
     * @param {ItemPF} target
     * @param {ActionUseShared} shared
     */
    static actionUseAlterRollData(target, shared) {
        const formula = target.getFlag(MODULE_NAME, this.key);
        const value = RollPF.safeTotal(formula, target.actor.getRollData());

        if (value) {
            shared.attackBonus.push(`${value}[${target.name}]`);
        }
    }

    /**
     * @override
     * @param {object} options
     * @param {ActorPF | null} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ item, html }) {
        const hasFlag = item.system.flags.boolean?.hasOwnProperty(this.key);
        if (!hasFlag) {
            return;
        }

        textInput({
            item,
            key: this.key,
            parent: html,
            label: this.label,
        }, {
            isFlag: true,
        });
    }
}