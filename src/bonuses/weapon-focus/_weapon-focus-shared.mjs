import { intersects } from "../../util/array-intersects.mjs";
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize } from "../../util/localize.mjs";
import { signed } from '../../util/to-signed-string.mjs';
import {
    WeaponFocus,
    WeaponFocusGreater,
    WeaponFocusMythic
} from "./weapon-focus.mjs";

const allBonuses = [WeaponFocus, WeaponFocusGreater, WeaponFocusMythic];

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const bonus = allBonuses.find((b) => b.has(item));
    if (!bonus) {
        return;
    }

    const currentTarget = bonus.getFocusedWeapons(item, { onlyActive: false })[0];
    if (!currentTarget) {
        return;
    }

    const label = `${currentTarget}`;

    const hint = hintcls.create(label, [], { hint: bonus.tooltip });
    return hint;
});

// register hint on focused weapon/attack
registerItemHint((hintcls, actor, item, _data) => {
    if (!actor) return;

    const baseTypes = item.system.baseTypes;
    if (!baseTypes?.length) return;

    const isFocused = intersects(baseTypes, WeaponFocus.getFocusedWeapons(actor));
    const isGreater = intersects(baseTypes, WeaponFocusGreater.getFocusedWeapons(actor));
    const isMythic = intersects(baseTypes, WeaponFocusMythic.getFocusedWeapons(actor));

    if (isFocused || isGreater || isMythic) {
        const tips = []
        let bonus = 0;
        if (isFocused) {
            tips.push(WeaponFocus.label);
            bonus += 1;
        }
        if (isGreater) {
            tips.push(WeaponFocusGreater.label);
            bonus += 1;
        }
        if (isMythic) {
            tips.push(WeaponFocusMythic.label);
            bonus *= 2;
        }
        tips.push(localize('to-hit-mod', { mod: signed(bonus) }));
        return hintcls.create('', [], { icon: 'ra ra-sword', hint: tips.join('\n') });
    }
});

/**
 * Add Weapon Focus to tooltip
 * @param {ItemPF} item
 * @param {ModifierSource[]} sources
 * @returns {ModifierSource[]}
 */
function getAttackSources(item, sources) {
    const actor = item.actor;
    if (!actor) return sources;

    const baseTypes = item.system.baseTypes;
    if (!baseTypes?.length) return sources;

    let value = 0;
    let name = WeaponFocus.label;

    if (intersects(baseTypes, WeaponFocus.getFocusedWeapons(actor))) {
        value += 1;
    }
    if (intersects(baseTypes, WeaponFocusGreater.getFocusedWeapons(actor))) {
        value += 1;
        name = WeaponFocusGreater.label;
    }
    if (intersects(baseTypes, WeaponFocusMythic.getFocusedWeapons(actor))) {
        value *= 2;
        name = WeaponFocusMythic.label;
    }

    if (value) {
        sources.push({ value, name, modifier: 'untyped', sort: -100, });
        return sources.sort((a, b) => b.sort - a.sort);
    }

    return sources;
}
Hooks.on(customGlobalHooks.itemGetAttackSources, getAttackSources);

/**
 * @param {ActionUse} actionUse
 */
function addWeaponFocusBonus({ actor, item, shared }) {
    if (!actor || !item.system.baseTypes?.length) return;

    const baseTypes = item.system.baseTypes;
    let value = 0;

    let label = '';

    if (intersects(baseTypes, WeaponFocus.getFocusedWeapons(actor))) {
        value += 1;
        label = WeaponFocus.label;
    }
    if (intersects(baseTypes, WeaponFocusGreater.getFocusedWeapons(actor))) {
        value += 1;
        label = WeaponFocusGreater.label;
    }
    if (intersects(baseTypes, WeaponFocusMythic.getFocusedWeapons(actor))) {
        value *= 2;
        label = WeaponFocusMythic.label;
    }

    if (value) {
        shared.attackBonus.push(`${value}[${label}]`);
    }
}
Hooks.on(customGlobalHooks.actionUseAlterRollData, addWeaponFocusBonus);
