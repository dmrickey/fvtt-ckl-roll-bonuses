// https://www.d20pfsrd.com/feats/combat-feats/martial-focus-combat/
// +1 damage to chosen weapon group with proficient weapon

import { MODULE_NAME } from '../consts.mjs';
import { keyValueSelect } from "../handlebars-handlers/bonus-inputs/key-value-select.mjs";
import { intersects } from "../util/array-intersects.mjs";
import { createChangeForTooltip } from '../util/conditional-helpers.mjs';
import { getCachedBonuses } from '../util/get-cached-bonuses.mjs';
import { getWeaponGroupChoicesFromActor, getWeaponGroupsFromActor } from '../util/get-weapon-groups-from-actor.mjs';
import { customGlobalHooks } from "../util/hooks.mjs";
import { registerItemHint } from "../util/item-hints.mjs";
import { localize, localizeBonusLabel, localizeBonusTooltip } from "../util/localize.mjs";
import { LanguageSettings } from "../util/settings.mjs";
import { truthiness } from "../util/truthiness.mjs";
import { SpecificBonus } from './_specific-bonus.mjs';

export class MartialFocus extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'martial-focus'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#martial-focus'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {string} weaponGroup
     * @returns {Promise<void>}
     */
    static async configure(item, weaponGroup) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: { [MODULE_NAME]: { [this.key]: weaponGroup } },
        });
    }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'W1eDSqiwljxDe0zl',
            isItemMatchFunc: (name) => name === Settings.name,
            showInputsFunc: (item, html, isEditable) => {
                const choices = getWeaponGroupChoicesFromActor(item.actor);
                const current = item.getFlag(MODULE_NAME, MartialFocus.key);

                keyValueSelect({
                    choices,
                    current,
                    item,
                    journal: this.journal,
                    key: this.key,
                    parent: html
                }, {
                    canEdit: isEditable,
                    inputType: 'specific-bonus',
                });
            },
            options: {
                defaultFlagValuesFunc: (item) => {
                    const systemGroupKeys = Object.keys(pf1.config.weaponGroups);
                    const choices = getWeaponGroupsFromActor(item.actor, false);
                    const choice = choices[0] || systemGroupKeys[0];
                    return {
                        [this.key]: choice,
                    }
                }
            }
        };
    }
}

class Settings {
    static get name() { return LanguageSettings.getTranslation(MartialFocus.key); }

    static {
        LanguageSettings.registerItemNameTranslation(MartialFocus.key);
    }
}

/**
 * @param {ActorPF} actor
 * @param {ItemPF} item
 * @returns {boolean}
 */
const isItemFocused = (actor, item) => {
    const weaponGroups = item.system.weaponGroups?.total ?? new Set();
    const focuses = getCachedBonuses(actor, MartialFocus.key)
        .flatMap(x => x.getFlag(MODULE_NAME, MartialFocus.key))
        .filter(truthiness);
    return intersects(weaponGroups, focuses);
}

/**
 * @param {ItemPF} item
 * @returns {ItemConditional | undefined}
 */
export function getMartialFocusCondtional(item) {
    const actor = item.actor;
    if (!actor || !item.system.weaponGroups) {
        return;
    }

    if (isItemFocused(actor, item)) {
        return new pf1.components.ItemConditional({
            default: true,
            name: Settings.name,
            modifiers: [{
                _id: foundry.utils.randomID(),
                critical: 'normal',
                formula: '+1',
                subTarget: 'allDamage',
                target: 'damage',
                type: 'untyped',
            }],
        });
    }
}

// register hint on source feat
registerItemHint((hintcls, _actor, item, _data) => {
    const has = MartialFocus.has(item);
    const current = /** @type {keyof WeaponGroups} */ (item.getFlag(MODULE_NAME, MartialFocus.key));
    if (has && current) {
        return hintcls.create(pf1.config.weaponGroups[current] ?? current, [], { hint: localizeBonusTooltip(MartialFocus.key) });
    }
});

// register hint on focused weapon/attack
registerItemHint((hintcls, actor, item, _data) => {
    if (!actor?.hasWeaponProficiency(item) || !item.system.weaponGroups) {
        return;
    }

    const isFocused = isItemFocused(actor, item);
    if (isFocused) {
        return hintcls.create(`+1 ${localize('PF1.Damage')}`, [], { hint: localizeBonusLabel(MartialFocus.key) });
    }
});

/**
 * @param {ActionUse} actionUse
 */
function addMartialFocus({ actor, item, shared }) {
    if (!actor?.hasWeaponProficiency(item)
        || !item.system.weaponGroups
    ) {
        return;
    }

    const isFocused = isItemFocused(actor, item);
    if (isFocused) {
        shared.damageBonus.push(`${1}[${localizeBonusLabel(MartialFocus.key)}]`);
    }
}
Hooks.on(customGlobalHooks.actionUseAlterRollData, addMartialFocus);

/**
 * Add Martial Focus to damage tooltip
 *
 * @param {ItemPF} item
 * @param {ItemChange[]} sources
 */
function getDamageTooltipSources(item, sources) {
    const actor = item.actor;
    if (!actor
        || !(item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF)
    ) {
        return sources;
    }

    const isFocused = isItemFocused(actor, item);
    if (isFocused) {
        const name = localizeBonusLabel(MartialFocus.key);
        const change = createChangeForTooltip({ name, value: 1 });
        return sources.push(change);
    }

    return sources;

};
Hooks.on(customGlobalHooks.getDamageTooltipSources, getDamageTooltipSources);

// this is a lot better, but it doesn't work because action.use doesn't read this data off of the roll data -- it re-looks it up itself.
// /**
//  * @param {ItemAction} action
//  * @param {RollData} rollData
//  */
// function getFocusedItemRollData(action, rollData) {
//     if (!(action instanceof pf1.components.ItemAction)) {
//         return;
//     }

//     const item = action.item;
//     if (!(item instanceof pf1.documents.item.ItemWeaponPF) && !(item instanceof pf1.documents.item.ItemAttackPF)) {
//         return;
//     }

//     if (!actor?.hasWeaponProficiency(item) || !item.system.weaponGroups) {
//         return;
//     }
//     const actor = action.actor;
//     if (!actor || !item.system.baseTypes?.length) return;

//     const weaponGroups = [...item.system.weaponGroups.value, ...item.system.weaponGroups.custom].map(x => x.trim()).filter(truthiness);
//     const focuses = new KeyedDFlagHelper(actor, {}, key).valuesForFlag(key);

//     const isFocused = intersects(weaponGroups, focuses);

//     if (isFocused && rollData.action.damage?.parts?.length) {
//         rollData.action.damage.parts.push({
//             formula: `1[${localizeSpecificLabel(key)}]`,
//             type: rollData.action.damage.parts[0].type,
//         });
//     }
// }
// Hooks.on('pf1GetRollData', getFocusedItemRollData);
