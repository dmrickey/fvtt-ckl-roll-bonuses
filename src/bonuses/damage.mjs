import { MODULE_NAME } from "../consts.mjs";
import { damageInput } from "../handlebars-handlers/bonus-inputs/damage-input.mjs";

const key = 'damage-input';

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    const hasFlag = item.system.flags.boolean?.hasOwnProperty(key);
    if (!hasFlag) {
        return;
    }

    const parts = item.getFlag(MODULE_NAME, key) ?? [];

    damageInput({
        item,
        key,
        parent: html,
        parts,
    });
});



