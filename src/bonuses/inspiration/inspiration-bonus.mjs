// https://www.d20pfsrd.com/classes/hybrid-classes/investigator/investigator-talents/paizo-investigator-talents/amazing-inspiration/

// When using inspiration, the investigator rolls a d8 instead of a d6. At 20th level, the investigator rolls 2d8 and adds both dice to the result.

import { MODULE_NAME } from '../../consts.mjs';
import { textInput } from '../../handlebars-handlers/bonus-inputs/text-input.mjs';
import { getSourceFlags } from '../../util/get-source-flag.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { localizeBonusTooltip } from '../../util/localize.mjs';
import { simplify } from '../../util/simplify-roll-formula.mjs';
import { SpecificBonus } from '../_specific-bonus.mjs';
import { Inspiration } from './inspiration.mjs';

export class InspirationBonus extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'inspiration-bonus'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#inspiration'; }

    /** @inheritdoc @override */
    static get parent() { return Inspiration.key; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {Formula} formula
     * @returns {Promise<void>}
     */
    static async configure(item, formula) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: { [MODULE_NAME]: { [this.key]: `${formula || ''}` } },
        });
    }

    /** @inheritdoc @override @returns {JustRender} */
    static get configuration() {
        return {
            type: 'just-render',
            showInputsFunc: (item, html, isEditable) => {
                const current = item.getFlag(MODULE_NAME, InspirationBonus.key);
                textInput({
                    current,
                    item,
                    journal: this.journal,
                    key: this.key,
                    parent: html,
                }, {
                    canEdit: isEditable,
                    isFormula: true,
                    inputType: 'bonus',
                });
            },
        };
    }

    /**
     * @param {Nullable<ActorPF>} actor
     * @param {RollData} rollData
     * @returns {string}
     */
    static getInspirationBonuses(actor, rollData) {
        if (!actor) return '';

        const hasBonus = InspirationBonus.has(actor);
        if (!hasBonus) return '';

        let bonus = '';
        const bonuses = getSourceFlags(actor, InspirationBonus);
        const formula = bonuses.join(' + ');
        const simplified = simplify(formula, rollData);
        if (simplified) {
            bonus = ` + ${simplified}`;
        }

        return bonus;
    }
}

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const has = !!item.hasItemBooleanFlag(InspirationBonus.key);
    if (!has) {
        return;
    }

    const hint = hintcls.create('', [], { hint: localizeBonusTooltip(InspirationBonus.key), icon: 'fas fa-magnifying-glass ckl-extra-focus' });
    return hint;
});
