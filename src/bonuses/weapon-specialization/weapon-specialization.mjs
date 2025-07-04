// https://www.d20pfsrd.com/feats/combat-feats/weapon-specialization-combat/
// +2 damage on selected weapon type - requires Weapon Focus with selected weapon

import { MODULE_NAME } from '../../consts.mjs';
import { stringSelect } from "../../handlebars-handlers/bonus-inputs/string-select.mjs";
import { intersects } from "../../util/array-intersects.mjs";
import { createChangeForTooltip } from '../../util/conditional-helpers.mjs';
import { getDocFlags } from '../../util/flag-helpers.mjs';
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize } from "../../util/localize.mjs";
import { LanguageSettings, SharedSettings } from "../../util/settings.mjs";
import { SpecificBonus } from '../_specific-bonus.mjs';
import { WeaponFocus } from '../weapon-focus/weapon-focus.mjs';

export class WeaponSpecialization extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'weapon-specialization'; }

    /** @inheritdoc @override */
    static get journal() { return 'Compendium.ckl-roll-bonuses.roll-bonuses-documentation.JournalEntry.FrG2K3YAM1jdSxcC.JournalEntryPage.ez01dzSQxPTiyXor#weapon-specialization'; }

    /**
     * @inheritdoc
     * @override
     * @param {ItemPF} item
     * @param {string} weaponType
     * @returns {Promise<void>}
     */
    static async configure(item, weaponType) {
        await item.update({
            system: { flags: { boolean: { [this.key]: true } } },
            flags: { [MODULE_NAME]: { [this.key]: weaponType } },
        });
    }

    /** @inheritdoc @override @returns {CreateAndRender} */
    static get configuration() {
        return {
            type: 'render-and-create',
            compendiumId: 'YLCvMNeAF9V31m1h',
            ignoreFunc: (_item) => SharedSettings.elephantInTheRoom,
            isItemMatchFunc: (name) => name === Settings.name,
            showInputsFunc: (item, html, isEditable) => {
                const actor = item.actor;
                const choices = (actor && isEditable)
                    ? WeaponFocus.getFocusedWeapons(actor)
                    : [];

                stringSelect({
                    choices,
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
                    const actor = item?.actor;
                    if (!actor) return;

                    const choice = WeaponFocus.getFocusedWeapons(actor)[0];
                    if (choice.length) {
                        return { [this.key]: choice };
                    }
                }
            }
        };
    }

    /**
     * @param { ActorPF | ItemPF } doc
     * @param {object} [options]
     * @param {boolean} [options.onlyActive] Default true - if it should return when the bonus is active
     * @returns {string[]}
     */
    static getSpecializedWeapons(doc, { onlyActive = true } = { onlyActive: true }) {
        return getDocFlags(doc, this.key, { onlyActive });
    }
}

class Settings {
    static get name() { return LanguageSettings.getTranslation(WeaponSpecialization.key); }

    static {
        LanguageSettings.registerItemNameTranslation(WeaponSpecialization.key);
    }
}
export { Settings as WeaponSpecializationSettings };

// register hint on source feat
registerItemHint((hintcls, _actor, item, _data) => {
    const has = WeaponSpecialization.has(item);
    const current = WeaponSpecialization.getSpecializedWeapons(item, { onlyActive: false })[0];
    if (has && current) {
        return hintcls.create(`${current}`, [], { hint: WeaponSpecialization.label });
    }
});

// register hint on focused weapon/attack
registerItemHint((hintcls, actor, item, _data) => {
    if (!item.system.baseTypes || !actor?.hasWeaponProficiency(item)) {
        return;
    }

    const baseTypes = item.system.baseTypes;
    const specializations = WeaponSpecialization.getSpecializedWeapons(actor);
    if (intersects(baseTypes, specializations)) {
        return hintcls.create(`+2 ${localize('PF1.Damage')}`, [], { hint: WeaponSpecialization.label });
    }
});

/**
 * @param {ActionUse} actionUse
 */
function addWeaponSpecialization({ actor, item, shared }) {
    if (!actor || !item.system.baseTypes?.length) {
        return;
    }

    const baseTypes = item.system.baseTypes;
    const specializations = WeaponSpecialization.getSpecializedWeapons(actor);
    if (intersects(baseTypes, specializations)) {
        shared.damageBonus.push(`${2}[${WeaponSpecialization.label}]`);
    }
}
Hooks.on(customGlobalHooks.actionUseAlterRollData, addWeaponSpecialization);

/**
 * @param {ItemPF} item
 * @returns {ItemConditional | undefined}
 */
export function getWeaponSpecializaitonConditional(item) {
    const actor = item.actor;
    if (!actor || !item.system.baseTypes?.length) {
        return;
    }

    const baseTypes = item.system.baseTypes;
    const specializations = WeaponSpecialization.getSpecializedWeapons(actor);
    if (intersects(baseTypes, specializations)) {
        return new pf1.components.ItemConditional({
            default: true,
            name: WeaponSpecialization.label,
            modifiers: [{
                _id: foundry.utils.randomID(),
                critical: 'normal',
                formula: '+2',
                subTarget: 'allDamage',
                target: 'damage',
                type: 'untyped',
            }],
        });
    }
}

/**
 * @param {ItemPF} item
 * @param {ItemChange[]} sources
 */
function getDamageTooltipSources(item, sources) {
    const actor = item.actor;
    if (!actor || !item.system.baseTypes?.length) {
        return sources;
    }

    const baseTypes = item.system.baseTypes;
    const specializations = WeaponSpecialization.getSpecializedWeapons(actor);
    if (intersects(baseTypes, specializations)) {
        const name = WeaponSpecialization.label;
        const change = createChangeForTooltip({ name, value: 2 });
        sources.push(change);
    }

    return sources;
};
Hooks.on(customGlobalHooks.getDamageTooltipSources, getDamageTooltipSources);
