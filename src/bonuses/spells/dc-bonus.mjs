import { textInput } from "../../handlebars-handlers/roll-inputs/text-input.mjs";
import { getDocDFlags } from "../../util/flag-helpers.mjs";
import { localHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize } from "../../util/localize.mjs";
import { signed } from "../../util/to-signed-string.mjs";

const key = 'genericSpellDC'

// add info to spell card
Hooks.on(localHooks.itemGetTypeChatData, (
    /** @type {ItemPF} */ item,
    /** @type {string[]} */ props,
    /** @type {RollData} */ _rollData,
) => {
    if (!item || !(item instanceof pf1.documents.item.ItemSpellPF)) return;
    const { actor } = item;
    if (!actor) return;

    const bonuses = getDocDFlags(actor, key);
    const bonus = bonuses
        .map((x) => RollPF.safeTotal(x, actor.getRollData()))
        .reduce((acc, cur) => acc + cur, 0);
    if (bonus) {
        props.push(localize('dc-label-mod', { mod: signed(bonus), label: localize('all-spells') }));
    }
});

// register hint on ability
registerItemHint((hintcls, actor, item, _data) => {
    const flag = item.getItemDictionaryFlag(key);
    if (!flag) {
        return;
    }

    const value = RollPF.safeTotal(flag, actor?.getRollData() ?? {})
    const mod = signed(value);
    const hint = hintcls.create(`${localize('dc-mod', { mod })} (${value})`, [], {});
    return hint;
});

Hooks.on('pf1GetRollData', (
    /** @type {ItemAction} */ action,
    /** @type {RollData} */ rollData
) => {
    if (!(action instanceof pf1.components.ItemAction)) {
        return;
    }

    const { actor } = action;
    if (!actor) {
        return;
    }

    const { item } = action;
    if (!(item instanceof pf1.documents.item.ItemSpellPF) || !rollData) {
        return;
    }

    rollData.dcBonus ||= 0;
    const bonuses = getDocDFlags(actor, key);
    bonuses.forEach(bonus => {
        rollData.dcBonus += RollPF.safeTotal(bonus, rollData);
    });
});

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    const hasFlag = item.system.flags.dictionary?.hasOwnProperty(key);
    if (!hasFlag) {
        return;
    }

    const current = getDocDFlags(item, key)[0];

    textInput(current, item, key, localize('all-spell-dc'), html);
});
