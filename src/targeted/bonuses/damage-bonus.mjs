import { MODULE_NAME } from "../../consts.mjs";
import { damageInput } from "../../handlebars-handlers/targeted/bonuses/damage.mjs";
import { conditionalModToItemChangeForDamageTooltip } from "../../util/conditional-helpers.mjs";
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
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.PiyJbkTuzKHugPSk#damage'; }

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
                const roll = RollPF.create(damage.formula, rollData);
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
                    const roll = RollPF.create(formula);
                    return roll.isDeterministic
                        ? signed(roll.evaluate({ async: false }).total)
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
     * @param {ItemPF} source
     * @returns {Nullable<ItemConditional>}
     */
    static getConditional(source) {
        const damages = this.#getCachedDamageBonuses(source);
        const conditional = this.#createConditional(damages, source.name);
        return conditional.modifiers?.length
            ? conditional
            : null;
    }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {ItemChange[]}
     */
    static getDamageSourcesForTooltip(source) {
        /** @type {ItemChange[]} */
        let sources = [];

        const conditional = this.getConditional(source);
        if (!conditional) {
            return sources;
        }

        sources = (conditional.modifiers ?? [])
            .filter((mod) => mod.target === 'damage')
            .map((mod) => conditionalModToItemChangeForDamageTooltip(conditional, mod, { isDamage: true }))
            .filter(truthiness);

        return sources;
    }

    /**
     * @inheritdoc
     * @override
     * @param {object} options
     * @param {ActorPF | null} options.actor
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        damageInput({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'bonus',
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
            return pf1.registry.damageTypes.get('untyped').name;
        }

        const valueLookup = ( /** @type {DamageType['id']} */ t) => pf1.registry.damageTypes.getLabels()[t] || t;
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
