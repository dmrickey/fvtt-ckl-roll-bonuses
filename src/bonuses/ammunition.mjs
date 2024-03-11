import { MODULE_NAME } from "../consts.mjs";
import { textInput } from "../handlebars-handlers/bonus-inputs/text-input.mjs";
import { damageInput } from "../handlebars-handlers/targeted/bonuses/damage.mjs";
import { localHooks } from "../util/hooks.mjs";
import { localize } from "../util/localize.mjs";

const ammoDamageKey = 'bonus_damage';
const ammoAttackKey = 'bonus_attack';

/**
 * @param {ItemPF} item
 * @return {DamageInputModel[]}
 */
function getDamageBonuses(item) {
    return item.getFlag(MODULE_NAME, ammoDamageKey) ?? [];
}

/**
 * @param {ActionUse} actionUse
 * @param {ConditionalPartsResults} result
 * @param {object} atk - The attack used.
 * @param {number} index - The index of the attack, in order of enabled attacks.
 */
function getConditionalParts(actionUse, result, atk, index) {
    const ammoId = actionUse.shared?.attacks?.[index]?.ammo;
    const ammo = actionUse.actor.items.get(ammoId);
    if (ammo) {
        const attack = ammo.getFlag(MODULE_NAME, ammoAttackKey);
        if (attack) {
            if (!attack) {
                return;
            }

            const label = attack.trim().endsWith(']')
                ? ''
                : `[${ammo.name}]`;
            result['attack.normal'].push(`${attack}${label}`);
        }

        const damages = getDamageBonuses(ammo);
        if (damages.length) {
            damages.forEach((damage) => {
                if (!damage?.formula?.trim()) {
                    return;
                }

                const label = damage.formula?.trim().endsWith(']')
                    ? ''
                    : `[${ammo.name}]`;
                /** @type {ConditionalPart} */
                const damageResult = [
                    `${damage.formula}${label}`,
                    damage.type,
                    false,
                ];
                switch (damage.crit) {
                    case 'crit': result['damage.crit'].push(damageResult); break;
                    case 'nonCrit': result['damage.nonCrit'].push(damageResult); break;
                    case 'normal': result['damage.normal'].push(damageResult); break;
                }
            });
        }
    }
}
Hooks.on(localHooks.getConditionalParts, getConditionalParts);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemLootPF) || item.subType !== 'ammo') {
        return;
    }

    damageInput({
        item,
        key: ammoDamageKey,
        parent: html,
    });
    textInput({
        item,
        key: ammoAttackKey,
        parent: html,
        label: localize('bonus.attack.label'),
    }, {
        isModuleFlag: true,
    });
});
