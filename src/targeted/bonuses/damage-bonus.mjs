import { MODULE_NAME } from "../../consts.mjs";
import { damageInput } from "../../handlebars-handlers/targeted/bonuses/damage.mjs";
import { handleBonusesFor } from '../../target-and-bonus-join.mjs';
import { changeTypeLabel } from '../../util/change-type-label.mjs';
import { conditionalModToItemChangeForDamageTooltip, createChange, damageTypesToString } from "../../util/conditional-helpers.mjs";
import { LocalHookHandler, localHooks } from "../../util/hooks.mjs";
import { localize } from "../../util/localize.mjs";
import { signed } from '../../util/to-signed-string.mjs';
import { truthiness } from "../../util/truthiness.mjs";
import { BaseBonus } from "./_base-bonus.mjs";

/** @extends BaseBonus */
export class DamageBonus extends BaseBonus {
    static get #changeKey() { return `${this.key}-change`; }

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
     * @override
     * @inheritdoc
     */
    static get label() { return localize('PF1.DamageBonus'); }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} item
     * @param {RollData} rollData
     */
    static prepareSourceData(item, rollData) {
        const damages = item.getFlag(MODULE_NAME, this.key) || [];
        damages.forEach((/** @type {DamageInputModel}*/ damage) => {
            item[MODULE_NAME][this.key] ||= [];
            try {
                const formula = Roll.replaceFormulaData(damage.formula, { item: rollData.item, class: rollData.class });
                item[MODULE_NAME][this.key].push(formula);
            }
            catch {
                console.error('Problem with formula', damage.formula, this.key, item);
                item[MODULE_NAME][this.key].push('0');
            }
        });

        const changes = item.getFlag(MODULE_NAME, this.#changeKey) || [];
        changes.forEach((/** @type {{formula: string, type: BonusTypes}}*/ change) => {
            item[MODULE_NAME][this.#changeKey] ||= [];
            try {
                const formula = Roll.replaceFormulaData(change.formula, { item: rollData.item, class: rollData.class });
                item[MODULE_NAME][this.#changeKey].push(formula);
            }
            catch {
                console.error('Problem with formula', change.formula, this.#changeKey, item);
                item[MODULE_NAME][this.#changeKey].push('0');
            }
        });
    }

    /**
     * @override
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        const changes = this.#getCachedDamageItemChange(source);
        const damages = this.#getCachedDamageBonuses(source);

        /**
         * @param {string[]} types
         * @returns
         */
        const typeLabel = (types) => {
            const label = damageTypesToString(types);
            return `[${label}]`;
        }

        /**
         * @param {Nullable<'crit' | 'nonCrit' | 'normal'>} crit
         * @returns {string}
         */
        const critLabel = (crit) => crit ? localize(`crit-damage-label.${crit}`) : '';

        const damageHints = damages
            .filter((d) => !!d.formula?.trim())
            .map(({ formula, types, crit }) => ({
                types,
                crit,
                formula: (() => {
                    const roll = RollPF.create(formula);
                    return roll.isDeterministic
                        ? signed(roll.evaluateSync({ maximize: true }).total)
                        : `(${formula})`;
                })(),
            }))
            .map((d) => `${d.formula}${typeLabel(d.types)}${critLabel(d.crit)}`);

        /**
         * @param {string | number} value
         * @returns {string}
         */
        const changeTypeValue = (value) => typeof value === 'string' ? `(${value})` : signed(value);

        const changeHints = changes
            .filter((d) => !!d.value)
            .map(({ value, type }) => `${changeTypeValue(value)}[${changeTypeLabel(/** @type {BonusTypes} */(type))}]`);

        const hints = [...damageHints, ...changeHints];

        if (!hints.length) {
            return;
        }

        return hints;
    }

    /**
     * @param {ItemPF} source
     * @returns {Nullable<ItemConditional>}
     */
    static #getConditional(source) {
        const damages = this.#getCachedDamageBonuses(source);
        const conditional = this.#createConditionalData(damages, source.name);
        return conditional.modifiers?.length
            ? new pf1.components.ItemConditional(conditional)
            : null;
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @param {ActionUse} _action
     * @returns {Nullable<ItemConditional[]>}
     */
    static getConditionals(source, _action) {
        const conditional = this.#getConditional(source);
        if (conditional) {
            return [conditional]
        }
    }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {ItemChange[]}
     */
    static getDamageSourcesForTooltip(source) {
        const conditional = this.#getConditional(source);
        if (!conditional) {
            return [];
        }

        const sources = (conditional._source.modifiers ?? [])
            .filter((mod) => mod.target === 'damage')
            .map((mod) => conditionalModToItemChangeForDamageTooltip(conditional, mod, { isDamage: true }))
            .filter(truthiness);

        return sources;
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {object} options
     * @param {{formula: string, type: BonusTypes}[]} [options.changes]
     * @param {DamageInputModel[]} [options.damages]
     * @returns {Promise<void>}
     */
    static async configure(item, { changes, damages }) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.key]: damages || [],
                    [this.#changeKey]: changes || [],
                },
            },
        });
    }

    /**
     * @override
     * @inheritdoc
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
            changeKey: this.#changeKey,
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
        })).filter((x) => !!x.formula);
    }

    /**
     * @param {DamageInputModel[]} damageBonuses
     * @param {string} name
     * @returns {ItemConditionalSourceData}
     */
    static #createConditionalData(damageBonuses, name) {
        return {
            _id: foundry.utils.randomID(),
            default: true,
            name,
            modifiers: damageBonuses?.map( /** @return {ItemConditionalModifierSourceData} */(bonus) => ({
                _id: foundry.utils.randomID(),
                critical: bonus.crit || 'normal', // normal | crit | nonCrit
                damageType: bonus.types,
                formula: bonus.formula,
                subTarget: 'allDamage',
                target: 'damage',
                type: damageTypesToString(bonus.types),
            })) ?? [],
        };
    }

    /**
     * @param {ItemPF} source
     * @returns {ItemChange[]}
     */
    static #getCachedDamageItemChange(source) {
        /** @type {{formula: string, type: BonusTypes}[]} */
        const flags = (source.getFlag(MODULE_NAME, this.#changeKey) || []);
        const changes = flags
            .map(({ type }, i) => ({
                type: type || 'untyped',
                value: source[MODULE_NAME][this.#changeKey]?.[i],
            }))
            .filter((x) => x.value?.trim())
            .map(({ type, value }) => {
                value = LocalHookHandler.fireHookWithReturnSync(localHooks.patchChangeValue, value, type, source.actor);
                const typeName = pf1.config.bonusTypes[type] || type;
                const name = `${source.name} (${typeName})`
                const change = createChange({
                    value,
                    target: 'damage',
                    type,
                    name,
                });
                return change;
            })
            .filter((x) => !!x.value);

        return changes;
    }

    static {
        /**
         * @this {ItemAction}
         * @param {ItemAction} action
         * @param {ItemChange[]} damageSources
         */
        function itemAction_damageSources(action, damageSources) {
            handleBonusesFor(
                action,
                (bonusType, sourceItem) => {
                    const changes = bonusType.#getCachedDamageItemChange(sourceItem);
                    damageSources.push(...changes);
                },
                { specificBonusType: DamageBonus }
            );
            return damageSources;
        };
        Hooks.once('init', () => {
            LocalHookHandler.registerHandler(localHooks.itemAction_damageSources, itemAction_damageSources);
        });
    }
}
