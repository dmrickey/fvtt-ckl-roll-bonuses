import { MODULE_NAME } from '../../../consts.mjs';
import { showLabel } from '../../../handlebars-handlers/bonus-inputs/show-label.mjs';
import { textInputAndKeyValueSelect } from '../../../handlebars-handlers/bonus-inputs/text-input-and-key-value-select.mjs';
import { traitInput } from '../../../handlebars-handlers/trait-input.mjs';
import { handleConditionalBonusesFor } from '../../../target-and-bonus-join.mjs';
import { createChange } from '../../../util/conditional-helpers.mjs';
import { FormulaCacheHelper } from '../../../util/flag-helpers.mjs';
import { getKeyedHintList } from '../../../util/get-keyed-hint-list.mjs';
import { getSourceFlag } from '../../../util/get-source-flag.mjs';
import { LocalHookHandler, localHooks } from '../../../util/hooks.mjs';
import { localize, localizeBonusLabel, localizeBonusTooltip } from '../../../util/localize.mjs';
import { toArray } from '../../../util/to-array.mjs';
import { BaseConditionalBonus } from './_base-conditional-bonus.mjs';

export class SaveBonus extends BaseConditionalBonus {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'save'; }
    static get chosenKey() { return `${this.key}-chosen`; }
    static get formulaKey() { return `${this.key}-formula`; }
    static get typeKey() { return `${this.key}-type`; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.VlFEvwU7m3nbjy5d#saving-throw'; }

    /**
     * @param {{ actor: ActorCharacterPF }} actorSheet
     * @param {`save.${SavingThrow}` | undefined} key
     * @param {{ content: HTMLElement }} html
     */
    static onTooltipRender({ actor }, key, html) {
        if (!key?.startsWith('save') || !actor) return;

        const savingThrow = /** @type {SavingThrow} */ (key.split('.')[1]);

        const sources = actor.itemFlags?.boolean?.[this.key]?.sources ?? [];
        if (!sources.length) return;

        const ul = document.createElement('ul');
        ul.classList.add('notes');

        const header = document.createElement('h4');
        header.textContent = localize('bonus-header-labels.conditional-bonus');

        ul.appendChild(header);

        let found = false;
        sources.forEach((source) => {
            const conditionalTargets = /** @type {Array<RollBonusesAPI['sources']['BaseConditionalTarget']>} */((source[MODULE_NAME]?.targets ?? []).filter(t => t.isConditionalTarget));

            const targetedIds = /** @type {SavingThrow[]} */  (getSourceFlag(source, this.chosenKey)) || [];
            if (!targetedIds.includes(savingThrow)) return;

            let bonusValue = this.isSource(source) && FormulaCacheHelper.getHint(source, this.formulaKey);
            if (!conditionalTargets.length || !bonusValue) return;

            const changeType = /** @type {BonusTypes} */ (source.getFlag(MODULE_NAME, this.typeKey));
            bonusValue += ' ' + pf1.config.bonusTypes[changeType] || changeType;

            const hints = [...conditionalTargets.map(t => t.fluentDescription(source)), bonusValue];
            hints.forEach((hint) => {
                const li = document.createElement('li');
                li.classList.add('note');
                li.innerHTML = hint;
                ul.appendChild(li);
            });
            found = true;
        });

        if (found) {
            html.content.append(ul);
        }
    }

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

        const chosen = /** @type {SavingThrow[]} */ (getSourceFlag(source, this.chosenKey)) || [];
        if (chosen.length) {
            hintText += '<br>' + getKeyedHintList(chosen, pf1.config.savingThrows);
        }

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
     * @param {SavingThrow} savingThrow
     * @returns {ItemChange | undefined}
     */
    static createChange(item, savingThrow) {
        const targetedIds = getSourceFlag(item, this.chosenKey);
        if (!targetedIds.includes(savingThrow)) return;

        const formula = FormulaCacheHelper.getModuleFlagFormula(item, this.formulaKey)[this.formulaKey];
        if (!formula) return;

        const change = createChange({
            value: FormulaCacheHelper.getModuleFlagValue(item, this.formulaKey),
            formula: formula,
            target: savingThrow,
            id: `${this.key}_${item.id}_${savingThrow}`,
            type: item.getFlag(MODULE_NAME, this.typeKey),
            name: item.name,
        });
        return change;
    }

    /**
     *
     * @param {ItemChange[]} changes
     * @param {ActorPF} actor
     * @param {SavingThrow} id
     * @returns {ItemChange[]}
     */
    static getActorSaveChanges(changes, actor, id) {
        handleConditionalBonusesFor(
            actor,
            SaveBonus,
            (bonus, item) => {
                const change = bonus.createChange(item, id);
                if (change) {
                    changes.push(change);
                }
            }
        );
        return changes;
    }
    static {
        LocalHookHandler.registerHandler(localHooks.getActorSaveChanges, this.getActorSaveChanges.bind(this));

        Hooks.on('renderPF1ExtendedTooltip', this.onTooltipRender.bind(this));
    }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {object} options
     * @param {string} [options.formula]
     * @param {BonusTypes} [options.changeType]
     * @param {ArrayOrSelf<SavingThrow>} [options.savingThrows]
     * @returns {Promise<void>}
     */
    static async configure(item, { formula, changeType, savingThrows }) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [this.chosenKey]: toArray(savingThrows),
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
        const skillChoices = pf1.config.savingThrows;
        const typeChoices = Object.entries(bonusTypes)
            .map(([key, label]) => ({ key, label }));

        showLabel({
            item,
            journal: this.journal,
            key: this.key,
            parent: html,
        }, {
            inputType: 'conditional-bonus',
        });
        textInputAndKeyValueSelect({
            item,
            journal: this.journal,
            label: localizeBonusLabel(`${this.key}-input`),
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
            isSubLabel: true,
        });
        traitInput({
            choices: skillChoices,
            hasCustom: false,
            item,
            journal: this.journal,
            key: this.chosenKey,
            label: localizeBonusLabel(this.chosenKey),
            parent: html,
            tooltip: this.tooltip,
        }, {
            canEdit: isEditable,
            inputType: 'conditional-bonus',
            isSubLabel: true,
        });
    }
}
