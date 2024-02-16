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
     * @param {ItemPF} item
     * @returns {boolean}
     */
    static isBonusSource(item) {
        const value = this.#getAttackBonus(item);
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
        const /** @type {ModifierSource[]} */ sources = [];

        const value = this.#getAttackBonus(targetSource);
        if (value) {
            sources.push({
                value,
                name: targetSource.name,
                modifier: 'untyped',
                sort: -100,
            });
        }

        return sources;
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
        const hasFlag = item.hasItemBooleanFlag(this.key);
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
     * @param {ItemPF} item
     */
    static #getAttackBonus(item) {
        const formula = item.getFlag(MODULE_NAME, this.key);
        const value = RollPF.safeTotal(formula, item.getRollData());
        return value;
    }
}
