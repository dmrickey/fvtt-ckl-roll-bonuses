// https://www.d20pfsrd.com/feats/combat-feats/devastating-strike-combat/

// Whenever you use Vital Strike, Improved Vital Strike, or Greater Vital Strike, you gain a +2 bonus on each extra weapon damage dice roll those feats grant (+6 maximum). This bonus damage is multiplied on a critical hit.

import { showEnabledLabel } from '../../handlebars-handlers/enabled-label.mjs';
import { registerItemHint } from "../../util/item-hints.mjs";
import { localizeBonusTooltip } from "../../util/localize.mjs";
import { LanguageSettings } from "../../util/settings.mjs";
import { SpecificBonus } from "../_specific-bonus.mjs";

export class DevastatingStrike extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'devastating-strike'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#vital-strike'; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'DEVWkg29qOYtoQ7e',
            isItemMatchFunc: (name) => name === Settings.devastatingStrike,
            showInputsFunc: (item, html, isEditable) =>
                showEnabledLabel(
                    {
                        item,
                        journal: this.journal,
                        key: DevastatingStrike.key,
                        parent: html,
                    },
                    {
                        canEdit: isEditable,
                        inputType: "specific-bonus",
                    }
                ),
        }
    }
}

export class DevastatingStrikeImproved extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'devastating-strike-improved'; }

    /** @inheritdoc @override */
    static get journal() { return DevastatingStrike.journal; }

    /** @inheritdoc @override */
    static get parent() { return DevastatingStrike.key; }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'cXRxY3sO0jrtADfD',
            isItemMatchFunc: (name) => name.includes(Settings.devastatingStrike) && name.includes(LanguageSettings.improved),
            showInputsFunc: (item, html, isEditable) =>
                showEnabledLabel(
                    {
                        item,
                        journal: this.journal,
                        key: DevastatingStrikeImproved.key,
                        parent: html,
                    },
                    {
                        canEdit: isEditable,
                        inputType: "specific-bonus",
                    }
                ),
        }
    }
}

class Settings {
    static get devastatingStrike() {
        return LanguageSettings.getTranslation(DevastatingStrike.key);
    }

    static {
        LanguageSettings.registerItemNameTranslation(DevastatingStrike.key);
    }
}

const hintInfo = /** @type {const} */ ({
    [DevastatingStrike.key]: { label: '', tooltipKey: DevastatingStrike.key, icon: 'fas fa-burst' },
    [DevastatingStrikeImproved.key]: {
        label: '',
        tooltipKey: DevastatingStrikeImproved.key,
        icon: 'fas fa-explosion',
    },
});
const allKeys = /** @type {const} */([DevastatingStrike.key, DevastatingStrikeImproved.key]);

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
