import { MODULE_NAME } from '../consts.mjs';
import { radioInput } from '../handlebars-handlers/bonus-inputs/radio-input.mjs';
import { textInputAndKeyValueSelect } from '../handlebars-handlers/bonus-inputs/text-input-and-key-value-select.mjs';
import { FormulaCacheHelper } from "../util/flag-helpers.mjs";
import { getCachedBonuses } from '../util/get-cached-bonuses.mjs';
import { LocalHookHandler, localHooks } from "../util/hooks.mjs";
import { localize, localizeBonusLabel, localizeBonusTooltip } from '../util/localize.mjs';
import { SpecificBonus } from './_specific-bonus.mjs';

/** @typedef {'add' | 'set'} SetType */

const setTypes = /** @type {const} */ (['add', 'set']);
/**
 * @param {SetType} id
 * @returns {string}
 */
const setLabelKey = (id) => {
    switch (id) {
        case 'add': return 'PF1.Application.ChangeEditor.Operator.Add';
        case 'set': return 'PF1.Application.ChangeEditor.Operator.Set';
    }
};

export class ChangeTypeModification extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'change-modification'; }

    static get changeTypeKey() { return `${this.key}-type`; }
    static get formulaKey() { return `${this.key}-formula`; }
    static get setTypeKey() { return `${this.key}-set-type`; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#change-modifier'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {Formula} formula
     * @param {BonusTypes} type
     * @param {SetType} addOrSet
     * @returns {Promise<void>}
     */
    static async configure(item, formula, type, addOrSet) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: {
                [MODULE_NAME]: {
                    [ChangeTypeModification.formulaKey]: formula + '',
                    [ChangeTypeModification.changeTypeKey]: type,
                    [ChangeTypeModification.setTypeKey]: addOrSet,
                }
            },
        });
    }

    /** @inheritdoc @override @returns {JustRender} */
    static get configuration() {
        return {
            type: 'just-render',
            showInputsFunc: (item, html, isEditable) => {
                const { bonusTypes } = pf1.config;
                const current = item.getFlag(MODULE_NAME, this.changeTypeKey);
                const formula = item.getFlag(MODULE_NAME, this.formulaKey);

                const choices = Object.entries(bonusTypes)
                    .map(([key, label]) => ({ key, label }));

                textInputAndKeyValueSelect({
                    item,
                    journal: this.journal,
                    label: localizeBonusLabel(this.formulaKey),
                    tooltip: localizeBonusTooltip(this.formulaKey),
                    parent: html,
                    select: { current, choices, key: this.changeTypeKey },
                    text: { current: formula, key: this.formulaKey },
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });

                radioInput(
                    {
                        item,
                        journal: this.journal,
                        parent: html,
                        key: this.setTypeKey,
                        values: setTypes.map((t) => ({
                            id: t,
                            label: localize(setLabelKey(t)),
                        })),
                    },
                    {
                        canEdit: isEditable,
                        inputType: 'specific-bonus',
                    },
                );
            },
        };
    }
}

FormulaCacheHelper.registerModuleFlag(ChangeTypeModification.formulaKey);

/**
 * @param {ItemPF} item
 * @returns {SetType}
 */
const getOffsetType = (item) => item.getFlag(MODULE_NAME, ChangeTypeModification.setTypeKey) || setTypes[0];

/**
 * @param {Formula} value
 * @param {BonusTypes} type
 * @param {Nullable<ActorPF>} actor
 * @returns {Formula}
 */
function patchChangeValue(value, type, actor) {
    if (!actor) {
        return value;
    }

    const bonuses = getCachedBonuses(actor, ChangeTypeModification.key)
        .filter((x) => x.getFlag(MODULE_NAME, ChangeTypeModification.changeTypeKey) === type);
    if (!bonuses.length) {
        return value;
    }

    const sets = bonuses
        .filter((x) => getOffsetType(x) === 'set');
    if (sets.length) {
        const item = sets.at(-1);
        if (!item) return 0;
        const value = FormulaCacheHelper.getModuleFlagValue(item, ChangeTypeModification.formulaKey);
        return value;
    }

    // if there are no 'set', then all are 'offset' so no need for second filter
    const offset = bonuses.reduce((acc, item) => acc + FormulaCacheHelper.getModuleFlagValue(item, ChangeTypeModification.formulaKey), 0);
    if (offset) {
        value = isNaN(+value) ? `${value} + ${offset}` : (+value + offset);
    }

    return value;
}
LocalHookHandler.registerHandler(localHooks.patchChangeValue, patchChangeValue);
