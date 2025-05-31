import { MODULE_NAME } from "../consts.mjs";
import { showLabel } from '../handlebars-handlers/bonus-inputs/show-label.mjs';
import { textInput } from "../handlebars-handlers/bonus-inputs/text-input.mjs";
import { damageInput } from "../handlebars-handlers/targeted/bonuses/damage.mjs";
import { traitInput } from '../handlebars-handlers/trait-input.mjs';
import { getBaneLabelForTargetsFromSource } from '../util/bane-helper.mjs';
import { getEnhancementBonusForAction } from '../util/enhancement-bonus-helper.mjs';
import { FormulaCacheHelper } from '../util/flag-helpers.mjs';
import { currentTargets } from '../util/get-current-targets.mjs';
import { LocalHookHandler, customGlobalHooks, localHooks } from "../util/hooks.mjs";
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../util/localize.mjs";
import { ammoBaneCreatureSubtype, ammoBaneCreatureType, ammoEnhancementKey, ammoEnhancementStacksKey } from './ammunition-shared-keys.mjs';

const ammoAttackKey = 'ammo-attack';
const ammoDamageKey = 'ammo-damage';
const ammoEffectKey = 'ammo-effect';

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

        const ammoMw = ammo.system.masterwork;
        const enhData = getEnhancementBonusForAction({
            action: actionUse.action,
            ammo,
            targets: currentTargets(),
        });

        const hasEnhBonus = itemEnh || enhData.total;
        if (ammoMw && !hasEnhBonus && !itemMw) {
            result['attack.normal'].push(`1[${localize('PF1.AmmunitionAbbr')} - ${localize('PF1.Masterwork')}]`)
        }
        else if (enhData.ammo && enhData.action) {
            let itemMwOffset = 0;
            if (itemMw && !itemEnh && enhData.ammo.total) {
                itemMwOffset = 1;
            }
            const diff = enhData.total - enhData.action.total;
            if (diff > 0) {
                const label = `${localize('PF1.AmmunitionAbbr')} ${localize('PF1.EnhancementBonus')}`;
                if (enhData.total - itemMwOffset) {
                    result['attack.normal'].push(`${diff - itemMwOffset}[${label} (${enhData.total})]`);
                }
                result['damage.normal'].push([`${diff}[${label} (${enhData.total})]`, [label], false]);
            }

            if (enhData.ammo.hasBane && !enhData.action.hasBane) {
                const label = getBaneLabelForTargetsFromSource(ammo, ammoBaneCreatureType, ammoBaneCreatureSubtype);
                result['damage.nonCrit'].push([`2d6[${label}]`, [], false])
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
                    [...damage.types],
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
        let ammo = chatAttack.actor.items.get(chatAttack.ammo.id);
        if (!ammo) {
            const containerItems = chatAttack.actor.itemTypes.container.flatMap((c) => [...c.items]);
            ammo = containerItems.find((x) => x.id === chatAttack.ammo.id);
        }
        if (ammo) {
            const note = ammo.getFlag(MODULE_NAME, ammoEffectKey);
            if (note) {
                chatAttack.effectNotes.push({ text: note, source: ammo.name });
            }
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

    textInput({
        item,
        journal,
        key: ammoEnhancementKey,
        parent: html,
    }, {
        canEdit: isEditable,
        inputType: 'ammo',
    });
    textInput({
        item,
        journal,
        key: ammoEnhancementStacksKey,
        parent: html,
    }, {
        canEdit: isEditable,
        inputType: 'ammo',
    });
    textInput({
        item,
        journal,
        key: ammoAttackKey,
        parent: html,
    }, {
        canEdit: isEditable,
        inputType: 'ammo',
    });
    damageInput({
        item,
        journal,
        key: ammoDamageKey,
        parent: html,
    }, {
        canEdit: isEditable,
        inputType: 'ammo',
    });
    showLabel({
        item,
        journal,
        parent: html,
        label: localizeBonusLabel('target_bane'),
        tooltip: localizeBonusTooltip('target_bane'),
    }, {
        inputType: 'ammo',
    });
    traitInput({
        choices: pf1.config.creatureTypes,
        item,
        journal,
        key: ammoBaneCreatureType,
        label: localize('PF1.CreatureType'),
        parent: html,
        tooltip: localizeBonusTooltip('target_bane'),
    }, {
        canEdit: isEditable,
        inputType: 'ammo',
        isSubLabel: true,
    });
    traitInput({
        choices: pf1.config.creatureSubtypes,
        item,
        journal,
        key: ammoBaneCreatureSubtype,
        label: localize('PF1.CreatureSubTypes.Single'),
        parent: html,
        tooltip: localizeBonusTooltip('target_bane'),
    }, {
        canEdit: isEditable,
        inputType: 'ammo',
        isSubLabel: true,
    });
    textInput({
        item,
        journal,
        key: ammoEffectKey,
        parent: html,
    }, {
        canEdit: isEditable,
        isFormula: false,
        inputType: 'ammo',
    });
});

LocalHookHandler.registerHandler(localHooks.prepareData, (item, rollData) => {
    const damages = item.getFlag(MODULE_NAME, ammoDamageKey) || [];
    damages.forEach((/** @type {DamageInputModel}*/ damage) => {
        const formula = Roll.replaceFormulaData(damage.formula, { item: rollData.item, class: rollData.class });
        item[MODULE_NAME][ammoDamageKey] ||= [];
        item[MODULE_NAME][ammoDamageKey].push(formula);
    });
});

/**
 * @param {ItemPF} item
 * @return {(Pick<DamageInputModel, 'crit' | 'types' | 'formula'>)[]}
 */
function getCachedDamageBonuses(item) {
    /** @type {DamageInputModel[]} */
    const damages = item.getFlag(MODULE_NAME, ammoDamageKey) ?? [];

    return damages.map((damage, i) => ({
        ...damage,
        formula: item[MODULE_NAME][ammoDamageKey][i],
    }));
}
