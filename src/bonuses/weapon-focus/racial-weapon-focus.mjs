import { MODULE_NAME } from "../../consts.mjs";
import { intersects } from '../../util/array-intersects.mjs';
import { getCachedBonuses } from '../../util/get-cached-bonuses.mjs';
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../../util/localize.mjs";
import { truthiness } from '../../util/truthiness.mjs';
import { WeaponFocus, WeaponFocusRacial } from "./weapon-focus.mjs";

/**
 * @param {ActorPF} actor
 * @param {ItemPF} item
 * @returns {boolean}
 */
const isItemFocused = (actor, item) => {
    const tags = (item.system.tags || []).map((tag) => tag.toLocaleLowerCase());
    const values = getCachedBonuses(actor, WeaponFocusRacial.key)
        .map(x => x.getFlag(MODULE_NAME, WeaponFocusRacial.key))
        .filter(truthiness)
        .map(x => x.toLocaleLowerCase());
    return intersects(tags, values);
}

// register hint on source
registerItemHint((hintcls, _actor, item, _data) => {
    const has = item.hasItemBooleanFlag(WeaponFocusRacial.key);
    const current = item.getFlag(MODULE_NAME, WeaponFocusRacial.key);
    if (!has || !current) {
        return;
    }

    const label = `${current}`;

    const hint = hintcls.create(label, [], { hint: localizeBonusTooltip(WeaponFocusRacial.key) });
    return hint;
});

// register hint on focused weapon/attack
registerItemHint((hintcls, actor, item, _data) => {
    if (!['attack', 'weapon'].includes(item.type) || !actor) return;

    const isFocused = isItemFocused(actor, item);
    if (isFocused) {
        const label = localize(`settings.${WeaponFocusRacial.key}.name`);
        return hintcls.create(label, [], {});
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

    const isFocused = isItemFocused(actor, item);
    if (isFocused) {
        sources.push({ value: 1, name: localizeBonusLabel(WeaponFocus.key), modifier: 'untyped', sort: -100 });
        return sources.sort((a, b) => b.sort - a.sort);
    }

    return sources;
}
Hooks.on(customGlobalHooks.itemGetAttackSources, getAttackSources);

/**
 * Add weapon focus to attack roll
 * @param {ActionUse} actionUse
 */
function addWeaponFocusBonus({ actor, item, shared }) {
    if (!actor || !item?.system.tags?.length) return;

    const isFocused = isItemFocused(actor, item);
    if (isFocused) {
        shared.attackBonus.push(`${1}[${WeaponFocus.label}]`);
    }
}
Hooks.on(customGlobalHooks.actionUseAlterRollData, addWeaponFocusBonus);
