import { MODULE_NAME } from '../../../consts.mjs';
import { showLabel } from '../../../handlebars-handlers/bonus-inputs/show-label.mjs';
import { textInputAndKeyValueSelect } from '../../../handlebars-handlers/bonus-inputs/text-input-and-key-value-select.mjs';
import { handleConditionalBonusesFor } from '../../../target-and-bonus-join.mjs';
import { createChange } from '../../../util/conditional-helpers.mjs';
import { FormulaCacheHelper } from '../../../util/flag-helpers.mjs';
import { localizeBonusLabel, localizeBonusTooltip } from '../../../util/localize.mjs';
import { BaseConditionalBonus } from './_base-conditional-bonus.mjs';

export class ACBonus extends BaseConditionalBonus {

    /**
     * @override
     * @inheritdoc
     */
    static get sourceKey() { return 'ac'; }
    static get formulaKey() { return `${this.key}-formula`; }
    static get typeKey() { return `${this.key}-type`; }

    /**
     * @override
     * @returns {string}
     */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.VlFEvwU7m3nbjy5d#armor-class'; }

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
            target: "aac",
            id: `${this.key}_${item.id}`,
            type: item.getFlag(MODULE_NAME, this.typeKey),
            name: item.name,
        });
        return change;
    }

    /**
     *
     * @param {ItemChange[]} changes
     * @param {ActorPF} actor
     * @returns {ItemChange[]}
     */
    static getActorACChanges(changes, actor) {
        handleConditionalBonusesFor(
            actor,
            ACBonus,
            (bonus, item) => {
                const change = bonus.createChange(item);
                if (change) {
                    changes.push(change);
                }
            }
        );
        return changes;
    }
    static {
        // LocalHookHandler.registerHandler(localHooks.getActorACChanges, this.getActorACChanges.bind(this));
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
    }
}
