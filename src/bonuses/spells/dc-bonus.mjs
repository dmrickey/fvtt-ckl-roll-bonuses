import { textInput } from "../../handlebars-handlers/bonus-inputs/text-input.mjs";
import { FormulaCacheHelper, KeyedDFlagHelper, getDocDFlags } from "../../util/flag-helpers.mjs";
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize, localizeBonusLabel } from "../../util/localize.mjs";
import { signed } from "../../util/to-signed-string.mjs";

// todo refactor 'all-spell-dc'
const key = 'genericSpellDC'
const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#*modify-spell-dc-(all-spells,-specific-school,-or-specific-eleme';

FormulaCacheHelper.registerDictionaryFlag(key);

// add info to spell card
Hooks.on(customGlobalHooks.itemGetTypeChatData, (
    /** @type {ItemPF} */ item,
    /** @type {string[]} */ props,
    /** @type {RollData} */ _rollData,
) => {
    if (!item || !(item instanceof pf1.documents.item.ItemSpellPF)) return;
    const { actor } = item;
    if (!actor) return;

    const bonus = new KeyedDFlagHelper(actor, {}, key).sumAll();
    if (bonus) {
        props.push(localize('dc-label-mod', { mod: signed(bonus), label: localize('all-spells') }));
    }
});

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const value = FormulaCacheHelper.getDictionaryFlagValue(item, key);
    if (!value) return;

    const mod = signed(value);
    const hint = hintcls.create(`${localize('dc-mod', { mod })} (${localize('all-spells')})`, [], {});
    return hint;
});

Hooks.on('pf1GetRollData', (
    /** @type {ItemAction} */ action,
    /** @type {RollData} */ rollData
) => {
    if (!(action instanceof pf1.components.ItemAction)) {
        return;
    }

    const { actor, item } = action;
    if (!actor
        || !(item instanceof pf1.documents.item.ItemSpellPF)
        || !rollData
    ) {
        return;
    }

    const total = new KeyedDFlagHelper(actor, {}, key).sumAll();
    rollData.dcBonus ||= 0;
    rollData.dcBonus += total;
});

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemPF)) return;

    const hasFlag = item.system.flags.dictionary?.hasOwnProperty(key);
    if (!hasFlag) {
        return;
    }

    const current = getDocDFlags(item, key)[0];

    textInput({
        current,
        item,
        journal,
        key,
        label: localizeBonusLabel('all-spell-dc'),
        parent: html,
    });
});
