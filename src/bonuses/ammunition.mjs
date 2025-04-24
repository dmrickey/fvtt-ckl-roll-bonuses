import { MODULE_NAME } from "../consts.mjs";
import { textInput } from "../handlebars-handlers/bonus-inputs/text-input.mjs";
import { damageInput } from "../handlebars-handlers/targeted/bonuses/damage.mjs";
import { traitInput } from '../handlebars-handlers/trait-input.mjs';
import { getEnhancementBonusForAction } from '../util/enhancement-bonus-helper.mjs';
import { FormulaCacheHelper } from '../util/flag-helpers.mjs';
import { getTraitsFromItem } from '../util/get-id-array-from-flag.mjs';
import { LocalHookHandler, customGlobalHooks, localHooks } from "../util/hooks.mjs";
import { localize } from "../util/localize.mjs";
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

        const { base: actionBaseEnh, stacks: actionStacksEnh, total: actionTotal } = getEnhancementBonusForAction({ action: actionUse.action });

        const ammoMw = ammo.system.masterwork;
        const ammoEnhBonus = FormulaCacheHelper.getModuleFlagValue(ammo, ammoEnhancementKey);
        const ammoEnhStacksBonus = FormulaCacheHelper.getModuleFlagValue(ammo, ammoEnhancementStacksKey);
        const hasEnhBonus = itemEnh || actionBaseEnh || actionStacksEnh || ammoEnhBonus || ammoEnhStacksBonus;
        if (ammoMw && !hasEnhBonus && !itemMw) {
            result['attack.normal'].push(`1[${localize('PF1.AmmunitionAbbr')} - ${localize('PF1.Masterwork')}]`)
        }
        else {
            const { hasBane, total: totalWithAmmo } = getEnhancementBonusForAction({
                action: actionUse.action,
                ammo,
                targets: [...game.user.targets],
            });
            let itemMwOffset = 0;
            if (itemMw && !itemEnh && (ammoEnhBonus || ammoEnhStacksBonus)) {
                itemMwOffset = 1;
            }
            const diff = totalWithAmmo - actionTotal;
            if (diff > 0) {
                const label = `${localize('PF1.AmmunitionAbbr')} ${localize('PF1.EnhancementBonus')}`;
                if (totalWithAmmo - itemMwOffset) {
                    result['attack.normal'].push(`${diff - itemMwOffset}[${label} (${totalWithAmmo})]`);
                }
                result['damage.normal'].push([`${diff}[${label} (${totalWithAmmo})]`, [label], false]);
            }

            if (hasBane) {
                // todo map to traits
                const creatureTypes = getTraitsFromItem(ammo, ammoBaneCreatureType, pf1.config.creatureTypes);
                const creatureSubtypes = getTraitsFromItem(ammo, ammoBaneCreatureSubtype, pf1.config.creatureSubtypes);
                const label = creatureSubtypes.total.size && creatureTypes.total.size
                    ? localize('bane-type-subtype', { type: creatureTypes.names.join(', '), subtype: creatureSubtypes.names.join(', ') })
                    : creatureTypes.total.size
                        ? localize('bane-type', { type: creatureTypes.names.join(', ') })
                        : localize('bane-type', { type: creatureSubtypes.names.join(', ') });
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
            const note = ammo[MODULE_NAME][ammoEffectKey];
            if (note) {
                const enriched = await TextEditor.enrichHTML(`<div>${note}</div>`, { async: true });
                chatAttack.effectNotes.push({ text: enriched, source: ammo.name });
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
    traitInput({
        choices: pf1.config.creatureTypes,
        item,
        label: localize('bane-creature-type'),
        journal,
        key: ammoBaneCreatureType,
        parent: html,
    }, {
        canEdit: isEditable,
        inputType: 'ammo',
    });
    traitInput({
        choices: pf1.config.creatureSubtypes,
        item,
        label: localize('bane-creature-subtype'),
        journal,
        key: ammoBaneCreatureSubtype,
        parent: html,
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
        item[MODULE_NAME][ammoDamageKey] ||= [];
        const roll = RollPF.create(damage.formula, rollData);
        item[MODULE_NAME][ammoDamageKey].push(roll.simplifiedFormula);
    });

    let note = item.getFlag(MODULE_NAME, ammoEffectKey);
    if (note) {
        const r = /\[\[([^\[].+?)\]\]/g;
        const matches = [...note.matchAll(r)];

        // const simplified = [];
        matches.forEach(([_, match]) => {
            const roll = RollPF.create(match, rollData);
            note = note.replace(match, roll.simplifiedFormula);
        });

        item[MODULE_NAME][ammoEffectKey] = note;
    }
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
