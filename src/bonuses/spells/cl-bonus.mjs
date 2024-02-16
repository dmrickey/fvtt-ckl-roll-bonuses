import { textInput } from "../../handlebars-handlers/bonus-inputs/text-input.mjs";
import { getDocDFlags } from "../../util/flag-helpers.mjs";
import { localHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize } from "../../util/localize.mjs";
import { signed } from "../../util/to-signed-string.mjs";

const key = 'all-spell-cl'

// add info to spell card
Hooks.on(localHooks.itemGetTypeChatData, (
    /** @type {ItemPF} */ item,
    /** @type {string[]} */ props,
    /** @type {RollData} */ rollData,
) => {
    if (!item || !(item instanceof pf1.documents.item.ItemSpellPF)) return;
    const { actor } = item;
    if (!actor) return;

    const bonuses = getDocDFlags(actor, key, { includeInactive: false });
    const bonus = bonuses
        .map((x) => RollPF.safeTotal(x, rollData))
        .reduce((acc, cur) => acc + cur, 0);
    if (bonus) {
        props.push(localize('cl-label-mod', { mod: signed(bonus), label: localize('all-spells') }));
    }
});

// register hint on source
registerItemHint((hintcls, actor, item, _data) => {
    const flag = item.getItemDictionaryFlag(key);
    if (!flag) {
        return;
    }

    const value = RollPF.safeTotal(flag, actor?.getRollData() ?? {})
    const mod = signed(value);
    const hint = hintcls.create(`${localize('cl-mod', { mod })} (${localize('all-spells')})`, [], {});
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

    rollData.cl ||= 0;
    const bonuses = getDocDFlags(actor, key, { includeInactive: false });
    bonuses.forEach(bonus => {
        rollData.cl += RollPF.safeTotal(bonus, rollData);
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

    textInput({
        current,
        item,
        key,
        label: localize('all-spell-cl'),
        parent: html,
    });
});
