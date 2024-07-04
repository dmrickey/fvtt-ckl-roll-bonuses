import { MODULE_NAME } from "../consts.mjs";
import { checkboxInput } from '../handlebars-handlers/bonus-inputs/chekbox-input.mjs';
import { textInput } from "../handlebars-handlers/bonus-inputs/text-input.mjs";
import { damageInput } from "../handlebars-handlers/targeted/bonuses/damage.mjs";
import { getEnhancementBonusForAction } from '../util/enhancement-bonus-helper.mjs';
import { FormulaCacheHelper } from '../util/flag-helpers.mjs';
import { LocalHookHandler, customGlobalHooks, localHooks } from "../util/hooks.mjs";
import { localize } from "../util/localize.mjs";
import { ammoEnhancementKey, ammoEnhancementStacksKey } from './ammunition-shared-keys.mjs';

const ammoAttackKey = 'ammo-attack';
const ammoDamageKey = 'ammo-damage';
const ammoEffectKey = 'ammo-effect';
const ammoMasterworkKey = 'ammo-mw';

const journal = 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#ammunition';

FormulaCacheHelper.registerModuleFlag(ammoAttackKey, ammoEnhancementKey, ammoEnhancementStacksKey);

/**
 * @param {ActionUse<ItemWeaponPF>} actionUse
 * @param {ConditionalPartsResults} result
 * @param {object} atk - The attack used.
 * @param {number} index - The index of the attack, in order of enabled attacks.
 */
function getConditionalParts(actionUse, result, atk, index) {
    const ammo = actionUse.shared?.attacks?.[index]?.ammo?.document;
    if (ammo) {
        const attack = FormulaCacheHelper.getModuleFlagFormula(ammo, ammoAttackKey)[ammoAttackKey];
        if (attack) {
            const label = `${attack}`.trim().endsWith(']')
                ? ''
                : `[${localize('PF1.AmmunitionAbbr')}]`;
            result['attack.normal'].push(`${attack}${label}`);
        }

        const item = actionUse.item;

        const itemMw = item.system.masterwork;
        const itemEnh = actionUse.action.enhancementBonus;

        const { base: actionBaseEnh, stacks: actionStacksEnh, total: actionTotal } = getEnhancementBonusForAction(actionUse.action);

        const ammoMw = !!ammo.getFlag(MODULE_NAME, ammoMasterworkKey);
        const ammoEnhBonus = FormulaCacheHelper.getModuleFlagValue(ammo, ammoEnhancementKey);
        const ammoEnhStacksBonus = FormulaCacheHelper.getModuleFlagValue(ammo, ammoEnhancementStacksKey);
        if (ammoMw
            && !itemMw
            && !itemEnh
            && !actionBaseEnh
            && !actionStacksEnh
            && !ammoEnhBonus
            && !ammoEnhStacksBonus
        ) {
            result['attack.normal'].push(`1[${localize('PF1.AmmunitionAbbr')} - ${localize('PF1.Masterwork')}]`)
        }
        else {
            const { total: ammoTotal } = getEnhancementBonusForAction(actionUse.action, ammo);
            const diff = ammoTotal - actionTotal;
            if (diff > 0) {
                const label = `${localize('PF1.AmmunitionAbbr')} ${localize('PF1.EnhancementBonus')}`;
                result['attack.normal'].push(`${diff}[${label} (${ammoTotal})]`);
                result['damage.normal'].push([`${diff}[${label} (${ammoTotal})]`, { values: [], custom: `${label}` }, false]);
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
                    : `[${localize('PF1.AmmunitionAbbr')}]`;
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

/**
 * @param {ChatAttack} chatAttack
 */
async function addEffectNotes(chatAttack) {
    if (chatAttack.ammo) {
        const ammo = chatAttack.actor.items.get(chatAttack.ammo.id)
        const note = ammo.getFlag(MODULE_NAME, ammoEffectKey);
        if (note) {
            const enriched = await TextEditor.enrichHTML(`<div>${note}</div>`, { rollData: ammo.getRollData() })
            chatAttack.effectNotes.push(enriched);
        }
    }
}
LocalHookHandler.registerHandler(localHooks.chatAttackEffectNotes, addEffectNotes);

Hooks.on('renderItemSheet', (
    /** @type {ItemSheetPF} */ { isEditable, item },
    /** @type {[HTMLElement]} */[html],
    /** @type {unknown} */ _data
) => {
    if (!(item instanceof pf1.documents.item.ItemLootPF) || item.subType !== 'ammo') {
        return;
    }

    checkboxInput({
        item,
        journal,
        key: ammoMasterworkKey,
        label: localize('PF1.Masterwork'),
        parent: html,
    }, {
        canEdit: isEditable,
        isModuleFlag: true,
    });
    textInput({
        item,
        journal,
        key: ammoEnhancementKey,
        parent: html,
    }, {
        canEdit: isEditable,
        isModuleFlag: true,
    });
    textInput({
        item,
        journal,
        key: ammoEnhancementStacksKey,
        parent: html,
    }, {
        canEdit: isEditable,
        isModuleFlag: true,
    });
    textInput({
        item,
        journal,
        key: ammoAttackKey,
        parent: html,
    }, {
        canEdit: isEditable,
        isModuleFlag: true,
    });
    damageInput({
        item,
        journal,
        key: ammoDamageKey,
        parent: html,
    }, {
        canEdit: isEditable,
    });
    textInput({
        item,
        journal,
        key: ammoEffectKey,
        parent: html,
    }, {
        canEdit: isEditable,
        isModuleFlag: true,
    });
});

LocalHookHandler.registerHandler(localHooks.prepareData, (item, rollData) => {
    const damages = item.getFlag(MODULE_NAME, ammoDamageKey) || [];
    damages.forEach((/** @type {DamageInputModel}*/ damage) => {
        item[MODULE_NAME][ammoDamageKey] ||= [];
        const roll = RollPF.safeRollSync(damage.formula, rollData);
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
