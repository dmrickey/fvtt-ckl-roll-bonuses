import { MODULE_NAME } from "../consts.mjs";
import { checkboxInput } from '../handlebars-handlers/bonus-inputs/chekbox-input.mjs';
import { textInput } from "../handlebars-handlers/bonus-inputs/text-input.mjs";
import { damageInput } from "../handlebars-handlers/targeted/bonuses/damage.mjs";
import { FormulaCacheHelper } from '../util/flag-helpers.mjs';
import { LocalHookHandler, customGlobalHooks, localHooks } from "../util/hooks.mjs";
import { localize } from "../util/localize.mjs";

const legacyAmmoDamageKey = 'bonus_damage';
const legacyAmmoAttackKey = 'bonus_attack';

const ammoDamageKey = 'ammo-damage';
const ammoAttackKey = 'ammo-attack';
const ammoMasterworkKey = 'ammo-mw';
const ammoEnhancementKey = 'ammo-enhancement'

FormulaCacheHelper.registerModuleFlag(ammoAttackKey, ammoEnhancementKey);

/**
 * @param {ActionUse<ItemWeaponPF>} actionUse
 * @param {ConditionalPartsResults} result
 * @param {object} atk - The attack used.
 * @param {number} index - The index of the attack, in order of enabled attacks.
 */
function getConditionalParts(actionUse, result, atk, index) {
    const ammoId = actionUse.shared?.attacks?.[index]?.ammo;
    const ammo = actionUse.actor.items.get(ammoId);
    if (ammo) {
        const attack = FormulaCacheHelper.getModuleFlagFormula(ammo, ammoAttackKey)[ammoAttackKey];
        if (attack) {
            const label = `${attack}`.trim().endsWith(']')
                ? ''
                : `[${ammo.name}]`;
            result['attack.normal'].push(`${attack}${label}`);
        }

        const mw = !!ammo.getFlag(MODULE_NAME, ammoMasterworkKey);
        const cachedEnhancementBonus = FormulaCacheHelper.getModuleFlagValue(ammo, ammoEnhancementKey);
        if (mw && !actionUse.item.system.masterwork && !cachedEnhancementBonus && !actionUse.item.system.enh) {
            result['attack.normal'].push(`1[${ammo.name} - ${localize('PF1.Masterwork')}]`)
        }
        else if (cachedEnhancementBonus) {
            const diff = cachedEnhancementBonus - actionUse.item.system.enh;
            if (diff > 0) {
                result['attack.normal'].push(`${diff}[${ammo.name} - ${localize('PF1.EnhancementBonus')} (${cachedEnhancementBonus})]`);
                result['damage.normal'].push([`${diff}[${ammo.name} - ${localize('PF1.EnhancementBonus')} (${cachedEnhancementBonus})]`, { values: [], custom: ammo.name }, false]);
            }
        }

        const damages = getCachedDamageBonuses(ammo);
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
Hooks.on(customGlobalHooks.getConditionalParts, getConditionalParts);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { actor, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemLootPF) || item.subType !== 'ammo') {
        return;
    }

    checkboxInput({
        item,
        key: ammoMasterworkKey,
        label: localize('PF1.Masterwork'),
        parent: html,
    }, {
        isModuleFlag: true,
    });
    textInput({
        item,
        key: ammoEnhancementKey,
        parent: html,
        label: localize('PF1.EnhancementBonus'),
    }, {
        isModuleFlag: true,
    });
    textInput({
        item,
        key: legacyAmmoAttackKey,
        parent: html,
        label: localize('bonus-target.bonus.label.attack'),
    }, {
        isModuleFlag: true,
    });
    damageInput({
        item,
        key: legacyAmmoDamageKey,
        parent: html,
    });
});

LocalHookHandler.registerHandler(localHooks.prepareData, (item, rollData) => {
    const damages = item.getFlag(MODULE_NAME, ammoDamageKey) || [];
    damages.forEach((/** @type {DamageInputModel}*/ damage) => {
        item[MODULE_NAME][ammoDamageKey] ||= [];
        const roll = RollPF.safeRoll(damage.formula, rollData);
        item[MODULE_NAME][ammoDamageKey].push(roll.simplifiedFormula);
    });
});

/**
 * @param {ItemPF} item
 * @return {DamageInputModel[]}
 */
function getCachedDamageBonuses(item) {
    /** @type {DamageInputModel[]} */
    const damages = item.getFlag(MODULE_NAME, ammoDamageKey) ?? [];

    return damages.map((damage, i) => ({
        ...damage,
        formula: item[MODULE_NAME][ammoDamageKey][i],
    }));
}
