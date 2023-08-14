import { MODULE_NAME } from "../../consts.mjs";
import { damageInput } from "../../handlebars-handlers/targeted/bonuses/damage.mjs";
import { conditionalModToItemChange } from "../../util/conditional-helpers.mjs";
import { truthiness } from "../../util/truthiness.mjs";
import { BaseBonus } from "./base-bonus.mjs";

/**
 * @extends BaseBonus
 */
export class DamageBonus extends BaseBonus {
    /**
     * @inheritdoc
     * @override
     */
    static get type() { return 'damage'; }

    /**
     * @inheritdoc
     * @override
     * @param {object} options
     * @param {ActorPF | null} options.actor
     * @param {ItemPF} options.item
     * @param {HTMLElement} options.html
     */
    static showInputOnItemSheet({ actor, item, html }) {
        const hasFlag = item.system.flags.boolean?.hasOwnProperty(this.key);
        if (!hasFlag) {
            return;
        }

        const parts = item.getFlag(MODULE_NAME, this.key) ?? [];

        damageInput({
            item,
            key: this.key,
            parent: html,
            parts,
        });
    }

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
     * @returns {Nullable<ItemConditional>}
     */
    static getConditional(target) {

        /** @type {RollData['action']['damage']['parts']} */
        const damages = target.getFlag(MODULE_NAME, this.key);

        const conditional = this.createConditional(damages, target.name);
        if (conditional.modifiers?.length) {
            return this.createConditional(damages, target.name);
        }

        return null;
    }

    /**
     *
     * @param {{ formula: string; type: TraitSelectorValuePlural }[]} damageBonuses
     * @param {string} name
     * @returns {ItemConditional}
     */
    static createConditional(damageBonuses, name) {
        return {
            _id: foundry.utils.randomID(),
            default: true,
            name,
            modifiers: damageBonuses?.map( /** @return {ItemConditionalModifier} */(bonus) => ({
                _id: foundry.utils.randomID(),
                critical: 'normal',
                damageType: bonus.type,
                formula: bonus.formula,
                subTarget: 'allDamage',
                target: 'damage',
                type: 'untyped',
            }) ?? []),
        }
    }

    /**
     * @override
     * @param {ItemPF} target
     * @returns {ItemChange[]}
     */
    static getDamageSourcesForTooltip(target) {
        /** @type {ItemChange[]} */
        let sources = [];

        const conditional = this.getConditional(target);
        if (!conditional) {
            return sources;
        }

        sources = (conditional.modifiers ?? [])
            .filter((mod) => mod.target === 'damage')
            .map((mod) => conditionalModToItemChange(conditional, mod))
            .filter(truthiness);

        return sources;
    }
}
