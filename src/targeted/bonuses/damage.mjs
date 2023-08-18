import { MODULE_NAME } from "../../consts.mjs";
import { damageInput } from "../../handlebars-handlers/targeted/bonuses/damage.mjs";
import { conditionalModToItemChange } from "../../util/conditional-helpers.mjs";
import { localize } from "../../util/localize.mjs";
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
     */
    static get label() { return localize('PF1.DamageBonus'); }

    /**
     * @override
     * @param {ItemPF} target
     * @returns {boolean}
     */
    static isBonusSource(target) {
        const damages = this.#getDamageBonuses(target);
        if (!damages.length) {
            return false;
        }

        if (!damages.filter(({ formula }) => !!formula?.trim()).length) {
            return false;
        }

        return true;
    };

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string>}
     */
    static registerHint(source) {
        const damages = this.#getDamageBonuses(source);
        if (!damages.length) {
            return;
        }

        const valueLookup = ( /** @type {keyof pf1['config']['damageTypes']} */ t) => pf1.config.damageTypes[t] || t;
        /**
         * @param {TraitSelectorValuePlural} t
         */
        // @ts-ignore
        const typeToString = (t) => `${t.custom?.trim() ? `${t.custom.trim()}, ` : ''}${t.values.map(valueLookup)}`;

        const hint = damages
            .filter((d) => !!d.formula?.trim())
            .map((d) => `${d.formula}[${d.type.custom}${typeToString(d.type)}]`)
            .join('\n');

        if (!hint) {
            return;
        }

        return hint;
    }

    /**
     * @override
     * @param {ItemPF} target
     * @returns {Nullable<ItemConditional>}
     */
    static getConditional(target) {

        const damages = this.#getDamageBonuses(target);

        const conditional = this.#createConditional(damages, target.name);
        if (conditional.modifiers?.length) {
            return this.#createConditional(damages, target.name);
        }

        return null;
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

        const parts = this.#getDamageBonuses(item);

        damageInput({
            item,
            key: this.key,
            parent: html,
            parts,
        });
    }

    /**
     *
     * @param {ItemPF} item
     * @return {RollData['action']['damage']['parts']}
     */
    static #getDamageBonuses(item) {
        return item.getFlag(MODULE_NAME, this.key) ?? [];
    }

    /**
     * @param {RollData['action']['damage']['parts']} damageBonuses
     * @param {string} name
     * @returns {ItemConditional}
     */
    static #createConditional(damageBonuses, name) {
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
                // type: bonus.type,
            }) ?? []),
        }
    }
}
