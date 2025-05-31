// https://www.d20pfsrd.com/feats/general-feats/focused-inspiration/

// Choose two skills that you either are trained in or can otherwise use untrained. You must be able to use inspiration on these skills. When you use inspiration with those skills, roll a d8 instead of a d6, or a d10 if you would normally roll a d8. If you have the true inspiration class feature, you roll twice as many such dice (2d8 or 2d10) as normal.

import { MODULE_NAME } from '../../consts.mjs';
import { traitInput } from '../../handlebars-handlers/trait-input.mjs';
import { getSkillChoices, getSkillHints } from '../../util/get-skills.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { localizeBonusTooltip } from '../../util/localize.mjs';
import { LanguageSettings } from '../../util/settings.mjs';
import { SpecificBonus } from '../_specific-bonus.mjs';
import { Inspiration } from './inspiration.mjs';

export class InspirationFocused extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'inspiration-focused'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#inspiration'; }

    /** @inheritdoc @override */
    static get parent() { return Inspiration.key; }

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

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'c6WT66xBw9y7KxUn',
            isItemMatchFunc: (name) => name === Settings.inspirationFocused,
            showInputsFunc: (item, html, isEditable) => {
                const choices = getSkillChoices(item.actor, { isEditable, includeAll: false });
                traitInput({
                    choices,
                    hasCustom: false,
                    item,
                    journal: this.journal,
                    key: InspirationFocused.key,
                    limit: 2,
                    parent: html,
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
        };
    }
}
class Settings {
    static get inspirationFocused() { return LanguageSettings.getTranslation(InspirationFocused.key); }

    static {
        LanguageSettings.registerItemNameTranslation(InspirationFocused.key);
    }
}

// register hint on source
registerItemHint((hintcls, actor, item, _data) => {
    const has = !!item.hasItemBooleanFlag(InspirationFocused.key);
    if (!has) {
        return;
    }

    let hintText = localizeBonusTooltip(InspirationFocused.key);
    const skills = getSkillHints(actor, item, InspirationFocused.key);
    if (skills.length) {
        hintText += '<br>' + skills;
    }

    const hint = hintcls.create('', [], { hint: hintText, icon: 'fas fa-magnifying-glass ckl-extra-focus' });
    return hint;
});
