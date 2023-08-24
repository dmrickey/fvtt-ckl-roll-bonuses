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
     * @param {ItemPF} target
     * @returns {boolean}
     */
    static isBonusSource(target) {
        const value = this.#getAttackBonus(target);
        return !!value;
    };

    /**
     * Register Item Hint on bonus
     *
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const formula = source.getFlag(MODULE_NAME, this.key)?.trim();
        if (formula) {
            return [formula];
        }
    }

    /**
     * @override
     * @param {ItemPF} targetSource
     * @returns {ModifierSource[]}
     */
    static getAttackSourcesForTooltip(targetSource) {
        const value = this.#getAttackBonus(targetSource);
        return [{
            value,
            name: targetSource.name,
            modifier: 'untyped',
            sort: -100,
        }];
    }

    /**
     * @override
     * @param {ItemPF} targetSource
     * @param {ActionUseShared} shared
     */
    static actionUseAlterRollData(targetSource, shared) {
        const value = this.#getAttackBonus(targetSource);
        if (value) {
            shared.attackBonus.push(`${value}[${targetSource.name}]`);
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

    /**
     *
     * @param {ItemPF} targetSource
     */
    static #getAttackBonus(targetSource) {
        const formula = targetSource.getFlag(MODULE_NAME, this.key);
        const value = RollPF.safeTotal(formula, targetSource.actor.getRollData());
        return value;
    }
}
