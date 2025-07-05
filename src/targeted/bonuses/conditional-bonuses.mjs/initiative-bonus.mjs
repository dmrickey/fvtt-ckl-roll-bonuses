import { MODULE_NAME } from '../../../consts.mjs';
import { textInputAndKeyValueSelect } from '../../../handlebars-handlers/bonus-inputs/text-input-and-key-value-select.mjs';
import { handleConditionalBonusesFor } from '../../../target-and-bonus-join.mjs';
import { createChange } from '../../../util/conditional-helpers.mjs';
import { FormulaCacheHelper } from '../../../util/flag-helpers.mjs';
import { localize, localizeBonusLabel, localizeBonusTooltip } from '../../../util/localize.mjs';
import { BaseConditionalBonus } from './_base-conditional-bonus.mjs';

export class InitiativeBonus extends BaseConditionalBonus {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'initiative'; }
    static get formulaKey() { return `${this.key}-formula`; }
    static get typeKey() { return `${this.key}-type`; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.VlFEvwU7m3nbjy5d#initiative'; }

    /**
     * @override
     * @inheritdoc
     * @param {ItemPF} source
     * @returns {Nullable<string[]>}
     */
    static getHints(source) {
        if (!source.actor) return;

        let hintText = localizeBonusTooltip(this.key);
        hintText += '<br>' + FormulaCacheHelper.getHint(source, this.formulaKey);

        const changeType = /** @type {BonusTypes} */ (source.getFlag(MODULE_NAME, this.typeKey));
        hintText += ' ' + pf1.config.bonusTypes[changeType] || changeType;

        return [hintText];
    }

    /**
     * @override
     * @inheritdoc
     */
    static init() {
        FormulaCacheHelper.registerModuleFlag(this.formulaKey);
    }

    /**
     * @param {ItemPF} item
     * @returns {ItemChange | undefined}
     */
    static createChange(item) {
        const formula = FormulaCacheHelper.getModuleFlagFormula(item, this.formulaKey)[this.formulaKey];
        if (!formula) return;

        const change = createChange({
            value: FormulaCacheHelper.getModuleFlagValue(item, this.formulaKey),
            formula: formula,
            target: "init",
            id: `${this.key}_${item.id}`,
            type: item.getFlag(MODULE_NAME, this.typeKey),
            name: item.name,
        });
        return change;
    }

    /**
     * @param {ActorPF} actor
     * @returns {ItemChange[]}
     */
    static getActorInitChanges(actor) {
        /** @type {ItemChange[]} */
        const changes = [];
        handleConditionalBonusesFor(
            actor,
            InitiativeBonus,
            (bonus, item) => {
                const change = bonus.createChange(item);
                if (change) {
                    changes.push(change);
                }
            }
        );
        return changes;
    }

    /**
     * Get unevaluated initiative roll instance.
     *
     * @this CombatantPF
     * @param {string} [formula] Initiative formula override
     * @param {string | null} [d20=null] D20 override
     * @param {number | null} [bonus=null] Bonus to initiative
     * @returns {D20RollPF} Initiative roll instance
     *
     * Synchronized with Foundry VTT 12.331
     */
    static getInitiativeRoll(formula, d20 = null, bonus = null) {
        const options = this.actor?.getInitiativeOptions?.() ?? {};

        formula ||= this._getInitiativeFormula(d20);
        const rollData = this.actor?.getRollData({ refresh: true }) || {}; // force refresh for when conditional updates that don't trigger roll data change
        if (bonus) {
            rollData.bonus = bonus;
            formula += " + @bonus";
        }

        // my override
        {
            if (this.actor) {
                const extraChanges = InitiativeBonus.getActorInitChanges(this.actor);
                if (extraChanges.length) {
                    const validChanges = this.actor.changes?.filter((/** @type {ItemChange} */ c) =>
                        c.getTargets(this.actor).includes('system.attributes.init.total')
                    ) ?? [];
                    const changes = pf1.documents.actor.changes.getHighestChanges([...extraChanges, ...validChanges], { ignoreTarget: true })
                        .filter(x => x.value);

                    // this works as a string because these values are already numbers, so this allows them to be labeled
                    const total = changes.map(x => `${x.value}[${x.flavor || x.name}]`).join(' + ');
                    // @ts-ignore
                    rollData.attributes.init.total = total;
                }
            }
        }

        return new pf1.dice.D20RollPF(formula, rollData, options);
    }

    /**
     * @param {{ actor: ActorCharacterPF }} actorSheet
     * @param {'init' | undefined} key
     * @param {{ content: HTMLElement }} html
     */
    static onTooltipRender({ actor }, key, html) {
        if (key !== 'init' || !actor) return;

        const sources = actor.itemFlags?.boolean?.[this.key]?.sources ?? [];
        if (!sources.length) return;

        const ul = document.createElement('ul');
        ul.classList.add('notes');

        const header = document.createElement('h4');
        header.textContent = localize('bonus-header-labels.conditional-bonus');

        ul.appendChild(header);

        sources.forEach((source) => {
            const conditionalTargets = /** @type {Array<RollBonusesAPI['sources']['BaseConditionalTarget']>} */((source[MODULE_NAME]?.targets ?? []).filter(t => t.isConditionalTarget));
            let init = this.isSource(source) && FormulaCacheHelper.getHint(source, this.formulaKey);
            if (!conditionalTargets.length || !init) return;

            const changeType = /** @type {BonusTypes} */ (source.getFlag(MODULE_NAME, this.typeKey));
            init += ' ' + pf1.config.bonusTypes[changeType] || changeType;

            const hints = [...conditionalTargets.map(t => t.fluentDescription(source)), init];
            hints.forEach((hint) => {
                const li = document.createElement('li');
                li.classList.add('note');
                li.innerHTML = hint;
                ul.appendChild(li);
            });
        });

        html.content.append(ul);
    }

    static {
        Hooks.once('init', () => {
            libWrapper.register(MODULE_NAME, 'pf1.documents.CombatantPF.prototype.getInitiativeRoll', InitiativeBonus.getInitiativeRoll, libWrapper.OVERRIDE)
        });

        Hooks.on('renderPF1ExtendedTooltip', this.onTooltipRender.bind(this));
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {object} options
     * @param {string} [options.formula]
     * @param {BonusTypes} [options.changeType]
     * @returns {Promise<void>}
     */
    static async configure(item, { formula, changeType }) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.formulaKey]: formula,
                    [this.typeKey]: changeType,
                },
            },
        });
    }

    /**
     * @override
     * @inheritdoc
     * @param {object} options
     * @param {HTMLElement} options.html
     * @param {boolean} options.isEditable
     * @param {ItemPF} options.item
     */
    static showInputOnItemSheet({ html, isEditable, item }) {
        const { bonusTypes } = pf1.config;
        const typeChoices = Object.entries(bonusTypes)
            .map(([key, label]) => ({ key, label }));

        textInputAndKeyValueSelect({
            item,
            journal: this.journal,
            label: localizeBonusLabel(this.key),
            parent: html,
            select: {
                choices: typeChoices,
                key: this.typeKey,
            },
            text: {
                key: this.formulaKey,
            },
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'conditional-bonus',
        });
    }
}
