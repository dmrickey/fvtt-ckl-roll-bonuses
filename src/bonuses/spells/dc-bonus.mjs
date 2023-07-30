import { getDocDFlags } from "../../util/flag-helpers.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize } from "../../util/localize.mjs";
import { signed } from "../../util/to-signed-string.mjs";

const key = 'genericSpellDC'

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
