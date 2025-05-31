// https://www.d20pfsrd.com/classes/hybrid-classes/investigator/investigator-talents/paizo-investigator-talents/empathy/

// Increases the amount of dice rolled with inspiration for specific skills (like Empathy linked above)

import { MODULE_NAME } from '../../consts.mjs';
import { traitInput } from '../../handlebars-handlers/trait-input.mjs';
import { getSkillChoices, getSkillHints } from '../../util/get-skills.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { localizeBonusTooltip } from '../../util/localize.mjs';
import { SpecificBonus } from '../_specific-bonus.mjs';
import { InspirationTenacious } from './inspiration-tenacious.mjs';
import { Inspiration } from './inspiration.mjs';

export class InspirationExtraDie extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'inspiration-extra-die'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#inspiration'; }

    /** @inheritdoc @override */
    static get parent() { return Inspiration.key; }

    /** @inheritdoc @override */
    static get tooltip() { return InspirationTenacious.tooltip; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {SkillId[]} skillIds
     * @returns {Promise<void>}
     */
    static async configure(item, skillIds) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: { [MODULE_NAME]: { [this.key]: skillIds } },
        });
    }

    /** @inheritdoc @override @returns {JustRender} */
    static get configuration() {
        return {
            type: 'just-render',
            showInputsFunc: (item, html, isEditable) => {
                const choices = getSkillChoices(item.actor, { isEditable });
                traitInput({
                    choices,
                    description: localizeBonusTooltip(InspirationTenacious.key),
                    hasCustom: false,
                    item,
                    journal: this.journal,
                    key: InspirationExtraDie.key,
                    tooltip: this.tooltip,
                    parent: html,
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
        };
    }
}

// register hint on source
registerItemHint((hintcls, actor, item, _data) => {
    const has = !!item.hasItemBooleanFlag(InspirationExtraDie.key);
    if (!has) {
        return;
    }

    let hintText = localizeBonusTooltip(InspirationTenacious.key);
    const skills = getSkillHints(actor, item, InspirationExtraDie.key);
    if (skills.length) {
        hintText += '<br>' + skills;
    }

    const hint = hintcls.create('', [], { hint: hintText, icon: 'fas fa-magnifying-glass ckl-extra-fa-magnifying-glass' });
    return hint;
});
