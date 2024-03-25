import { MODULE_NAME } from "../../consts.mjs";
import { damageInput } from "../../handlebars-handlers/targeted/bonuses/damage.mjs";
import { conditionalModToItemChange } from "../../util/conditional-helpers.mjs";
import { LocalHookHandler, localHooks } from "../../util/hooks.mjs";
import { localize } from "../../util/localize.mjs";
import { signed } from '../../util/to-signed-string.mjs';
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
    static get sourceKey() { return 'damage'; }

    /**
     * @inheritdoc
     * @override
     */
    static get label() { return localize('PF1.DamageBonus'); }

    /**
     * @override
     */
    static init() {
        LocalHookHandler.registerHandler(localHooks.prepareData, (item, rollData) => {
            const damages = item.getFlag(MODULE_NAME, this.key) || [];
            damages.forEach((/** @type {DamageInputModel}*/ damage) => {
                item[MODULE_NAME][this.key] ||= [];
                const roll = RollPF.safeRoll(damage.formula, rollData);
                item[MODULE_NAME][this.key].push(roll.simplifiedFormula);
            });
        });
    }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const damages = this.#getCachedDamageBonuses(source);
        if (!damages.length) {
            return;
        }

        /**
         *
         * @param {TraitSelectorValuePlural} types
         * @returns
         */
        const typeLabel = (types) => {
            const label = this.#damagesTypeToString(types);
            return `[${label}]`;
        }

        /**
         *
         * @param {Nullable<'crit' | 'nonCrit' | 'normal'>} crit
         * @returns string
         */
        const critLabel = (crit) => crit ? localize(`crit-damage-label.${crit}`) : '';

        const hints = damages
            .filter((d) => !!d.formula?.trim())
            .map(({ formula, type, crit }) => ({
                type,
                crit,
                formula: (() => {
                    const roll = RollPF.safeRoll(formula);
                    return roll.isNumber && roll.total
                        ? signed(roll.total)
                        : formula;
                })(),
            }))
            .map((d) => `${d.formula}${typeLabel(d.type)}${critLabel(d.crit)}`);

        if (!hints.length) {
            return;
        }

        return hints;
    }

    /**
     * @override
     * @param {ItemPF} target
     * @returns {Nullable<ItemConditional>}
     */
    static getConditional(target) {
        const damages = this.#getCachedDamageBonuses(target);
        const conditional = this.#createConditional(damages, target.name);
        return conditional.modifiers?.length
            ? conditional
            : null;
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
            .map((mod) => conditionalModToItemChange(conditional, mod, { isDamage: true }))
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
    static showInputOnItemSheet({ item, html }) {
        damageInput({
            item,
            key: this.key,
            parent: html,
        });
    }

    /**
     * @param {ItemPF} item
     * @return {DamageInputModel[]}
     */
    static #getCachedDamageBonuses(item) {
        /** @type {DamageInputModel[]} */
        const damages = item.getFlag(MODULE_NAME, this.key) ?? [];

        return damages.map((damage, i) => ({
            ...damage,
            formula: item[MODULE_NAME][this.key]?.[i],
        }));
    }

    /**
     * @param {TraitSelectorValuePlural} types
     * @returns {string}
     */
    static #damagesTypeToString(types) {
        if (!types.custom?.trim() && !types.values?.length) {
            return pf1.config.damageTypes.untyped;
        }

        const valueLookup = ( /** @type {keyof pf1['config']['damageTypes']} */ t) => pf1.config.damageTypes[t] || t;
        /**
         * @param {TraitSelectorValuePlural} t
         */
        // @ts-ignore
        const typeToString = (t) => `${t.custom?.trim() ? `${t.custom.trim()}, ` : ''}${t.values.map(valueLookup).join(', ')}`;
        return typeToString(types);
    }

    /**
     * @param {DamageInputModel[]} damageBonuses
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
                critical: bonus.crit || 'normal', // normal | crit | nonCrit
                damageType: bonus.type,
                formula: bonus.formula,
                subTarget: 'allDamage',
                target: 'damage',
                type: this.#damagesTypeToString(bonus.type),
            }) ?? []),
        }
    }
}
