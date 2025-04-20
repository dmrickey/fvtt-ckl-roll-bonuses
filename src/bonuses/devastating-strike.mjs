// https://www.d20pfsrd.com/feats/combat-feats/devastating-strike-combat/

// At 20th level, an investigator can use inspiration on all skill checks—even ones he isn’t trained in—and all ability checks without spending inspiration.
//
// Whenever you use Vital Strike, Improved Vital Strike, or Greater Vital Strike, you gain a +2 bonus on each extra weapon damage dice roll those feats grant (+6 maximum). This bonus damage is multiplied on a critical hit.

import { registerItemHint } from "../util/item-hints.mjs";
import { localizeBonusTooltip } from "../util/localize.mjs";
import { onCreate, onRenderCreate } from "../util/on-create.mjs";
import { SpecificBonuses } from "./_all-specific-bonuses.mjs";
import { LanguageSettings } from "../util/settings.mjs";
import { showEnabledLabel } from '../handlebars-handlers/enabled-label.mjs';

export const devastatingStrikeKey = "devastating-strike";
export const devastatingStrikeImprovedKey = "devastating-strike-improved";

const compendiumId = "DEVWkg29qOYtoQ7e";
const improvedCompendiumId = "cXRxY3sO0jrtADfD";
const journal =
    "Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#vital-strike";

class Settings {
    static get devastatingStrike() {
        return LanguageSettings.getTranslation(devastatingStrikeKey);
    }

    static {
        LanguageSettings.registerItemNameTranslation(devastatingStrikeKey);
    }
}

const hintInfo = /** @type {const} */ ({
    [devastatingStrikeKey]: { label: '', tooltipKey: devastatingStrikeKey, icon: 'fas fa-burst' },
    [devastatingStrikeImprovedKey]: {
        label: '',
        tooltipKey: devastatingStrikeImprovedKey,
        icon: 'fas fa-explosion',
    },
});
const allKeys = /** @type {const} */([devastatingStrikeKey, devastatingStrikeImprovedKey]);

SpecificBonuses.registerSpecificBonus({ journal, key: devastatingStrikeKey });
SpecificBonuses.registerSpecificBonus({
    journal,
    key: devastatingStrikeImprovedKey,
    parent: devastatingStrikeKey,
});

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const keys = allKeys.filter((k) => !!item.hasItemBooleanFlag(k));
    if (!keys.length) {
        return;
    }

    return keys.map((k) => {
        const info = hintInfo[k];
        return hintcls.create(info.label, [], {
            hint: localizeBonusTooltip(info.tooltipKey),
            icon: info.icon,
        });
    });
});

Hooks.on(
    'renderItemSheet',
    (
        /** @type {ItemSheetPF} */ { isEditable, item },
        /** @type {[HTMLElement]} */[html],
        /** @type {unknown} */ _data
    ) => {
        if (!(item instanceof pf1.documents.item.ItemPF)) return;

        if (onRenderCreate(item, devastatingStrikeKey, compendiumId, Settings.devastatingStrike, isEditable)) {
            showEnabledLabel(
                {
                    item,
                    journal,
                    key: devastatingStrikeKey,
                    parent: html,
                },
                {
                    canEdit: isEditable,
                    inputType: "specific-bonus",
                }
            );
        }
        if (onRenderCreate(
            item,
            devastatingStrikeImprovedKey,
            improvedCompendiumId,
            (name) => name.includes(Settings.devastatingStrike) && name.includes(LanguageSettings.improved),
            isEditable,
        )) {
            showEnabledLabel(
                {
                    item,
                    journal,
                    key: devastatingStrikeImprovedKey,
                    parent: html,
                },
                {
                    canEdit: isEditable,
                    inputType: "specific-bonus",
                }
            );
        }
    }
);

onCreate(
    compendiumId,
    () => Settings.devastatingStrike,
    {
        booleanKeys: devastatingStrikeKey,
    }
);
onCreate(
    improvedCompendiumId,
    () => `${LanguageSettings.improved} ${Settings.devastatingStrike}`,
    {
        booleanKeys: devastatingStrikeImprovedKey,
    }
);
