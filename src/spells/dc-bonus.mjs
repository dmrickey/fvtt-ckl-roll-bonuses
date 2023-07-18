import { getDocDFlags } from "../util/flag-helpers.mjs";
import { registerItemHint } from "../util/item-hints.mjs";
import { localize } from "../util/localize.mjs";

const key = 'genericSpellDC'

// register keen
registerItemHint((hintcls, actor, item, _data) => {
    const flag = item.getItemDictionaryFlag(key);
    if (!flag) {
        return;
    }

    const value = RollPF.safeTotal(flag, actor?.getRollData() ?? {})

    const hint = hintcls.create(`${localize(key)} (${value})`, [], {});
    return hint;
});

// before dialog pops up
Hooks.on('pf1PreActionUse', (/** @type {ActionUse} */ actionUse) => {
    const { actor, item, shared } = actionUse;
    if (item?.type !== 'spell') {
        return;
    }

    const bonuses = getDocDFlags(actor, key);
    bonuses.forEach(bonus => {
        shared.saveDC += RollPF.safeTotal(bonus, actor?.getRollData() ?? {});
    });
});
