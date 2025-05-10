import { traitInput } from '../../handlebars-handlers/trait-input.mjs';
import { itemHasCompendiumId } from '../../util/has-compendium-id.mjs';
import { registerItemHint } from '../../util/item-hints.mjs';
import { localizeBonusTooltip } from '../../util/localize.mjs';
import { onCreate } from '../../util/on-create.mjs';
import { SpecificBonus } from '../_specific-bonus.mjs';
import { allKnowledges, getSkillChoices, getSkillHints } from '../../util/get-skills.mjs';
import { LanguageSettings } from '../../util/settings.mjs';

const compendiumId = 'nKbyztRQCU5XMbbs';
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#inspiration';

export class Inspiration extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'inspiration'; }

    /** @inheritdoc @override */
    static get journal() { return journal; }
}
class Settings {
    static get inpsiration() { return LanguageSettings.getTranslation(Inspiration.sourceKey); }

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

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const hasFlag = item.hasItemBooleanFlag(Inspiration.key);
    if (!hasFlag) {
        const name = item?.name?.toLowerCase() ?? '';
        const hasCompendiumId = itemHasCompendiumId(item, compendiumId);
        if (isEditable && (name === Settings.inpsiration || hasCompendiumId)) {
            item.addItemBooleanFlag(Inspiration.key);
        }
        return;
    }

    const choices = getSkillChoices(item.actor, { isEditable });

    traitInput({
        choices,
        hasCustom: false,
        item,
        journal,
        key: Inspiration.key,
        parent: html,
    }, {
        canEdit: isEditable,
        inputType: 'specific-bonus',
    });
});

onCreate(
    compendiumId,
    () => Settings.inpsiration,
    {
        booleanKeys: Inspiration.key,
        // intentionally using `==` here
        extraVerification: (item) => !!item.system.sources?.find(({ id, pages }) => id === 'PZO1129' && pages == 31),
        flagValues: {
            [Inspiration.key]: /** @type {SkillId[]} */
                ([
                    allKnowledges,
                    'lin',
                    'spl',
                ]),
        }
    },
);
