import { traitInput } from '../../handlebars-handlers/trait-input.mjs';
import { itemHasCompendiumId } from '../../util/has-compendium-id.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { localizeBonusTooltip } from '../../util/localize.mjs';
import { onCreate } from '../../util/on-create.mjs';
import { SpecificBonus } from '../_specific-bonus.mjs';
import { allKnowledges, getSkillChoices, getSkillHints } from '../../util/get-skills.mjs';
import { LanguageSettings } from '../../util/settings.mjs';
import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';

export class Inspiration extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'inspiration'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#inspiration'; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'nKbyztRQCU5XMbbs',
            isItemMatchFunc: (name, item) => name === Settings.name && !!item?.system.sources?.find(({ id, pages }) => id === 'PZO1129' && pages == 31),
            itemFilter: (item) => item instanceof pf1.documents.item.ItemPF,
            showInputsFunc: (item, html, isEditable) => {
                const choices = getSkillChoices(item.actor, { isEditable });

                traitInput({
                    choices,
                    hasCustom: false,
                    item,
                    journal: this.journal,
                    key: this.key,
                    parent: html,
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
            options: {
                defaultFlagValuesFunc: () => ({
                    [Inspiration.key]: [
                        allKnowledges,
                        'lin',
                        'spl',
                    ]
                })
            },
        };
    }
}
class Settings {
    static get name() { return LanguageSettings.getTranslation(Inspiration.sourceKey); }

    static {
        LanguageSettings.registerItemNameTranslation(Inspiration.sourceKey);
    }
}

// register hint on source
registerItemHint((hintcls, actor, item, _data) => {
    const has = !!item.hasItemBooleanFlag(Inspiration.key);
    if (!has) {
        return;
    }

    let hintText = localizeBonusTooltip(Inspiration.key);
    const skills = getSkillHints(actor, item, Inspiration.key);
    if (skills.length) {
        hintText += '<br>' + skills;
    }

    const hint = hintcls.create('', [], { hint: hintText, icon: 'fas fa-magnifying-glass' });
    return hint;
});
