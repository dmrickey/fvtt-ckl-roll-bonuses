// https://www.d20pfsrd.com/feats/combat-feats/weapon-specialization-combat/
// +2 damage on selected weapon type - requires Greater Weapon Focus and Weapon Specialization with selected weapon

import { MODULE_NAME } from '../../consts.mjs';
import { stringSelect } from "../../handlebars-handlers/bonus-inputs/string-select.mjs";
import { intersection, intersects } from "../../util/array-intersects.mjs";
import { createChangeForTooltip } from '../../util/conditional-helpers.mjs';
import { getDocFlags } from '../../util/flag-helpers.mjs';
import { customGlobalHooks } from "../../util/hooks.mjs";
import { registerItemHint } from "../../util/item-hints.mjs";
import { localize } from "../../util/localize.mjs";
import { LanguageSettings, SharedSettings } from '../../util/settings.mjs';
import { SpecificBonus } from '../_specific-bonus.mjs';
import { WeaponSpecialization, WeaponSpecializationSettings } from './weapon-specialization.mjs';

export class WeaponSpecializationGreater extends SpecificBonus {
    /** @inheritdoc @override */
    static get sourceKey() { return 'weapon-specialization-greater'; }

    /** @inheritdoc @override */
    static get journal() { return WeaponSpecialization.journal; }

    /** @inheritdoc @override */
    static get parent() { return WeaponSpecialization.key; }

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
            compendiumId: 'asmQDyDYTtuXg8b4',
            isItemMatchFunc: (name) => LanguageSettings.isGreater(name, WeaponSpecializationSettings.name),
            showInputsFunc: (item, html, isEditable) => {
                const actor = item.actor;
                const choices = (actor && isEditable)
                    ? WeaponSpecialization.getSpecializedWeapons(actor)
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
            ignoreFunc: (_item) => SharedSettings.elephantInTheRoom,
            options: {
                defaultFlagValuesFunc: (item) => {
                    const actor = item?.actor;
                    if (!actor) return;

                    const choice = WeaponSpecialization.getSpecializedWeapons(actor)[0];
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
    static getGreaterSpecializedWeapons(doc, { onlyActive = true } = { onlyActive: true }) {
        return getDocFlags(doc, this.key, { onlyActive });
    }
}

// register hint on source feat
registerItemHint((hintcls, _actor, item, _data) => {
    const has = WeaponSpecializationGreater.has(item);
    const current = WeaponSpecializationGreater.getGreaterSpecializedWeapons(item, { onlyActive: false })[0];
    if (has && current) {
        return hintcls.create(`${current}`, [], { hint: WeaponSpecializationGreater.tooltip });
    }
});

// register hint on focused weapon/attack
registerItemHint((hintcls, actor, item, _data) => {
    if (!actor?.hasWeaponProficiency(item)) {
        return;
    }

    const baseTypes = item.system.baseTypes;
    if (!baseTypes?.length) return;

    const specializations = WeaponSpecializationGreater.getGreaterSpecializedWeapons(actor);
    if (intersects(baseTypes, specializations)) {
        return hintcls.create(`+2 ${localize('PF1.Damage')}`, [], { hint: WeaponSpecializationGreater.label });
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
    const specializations = WeaponSpecializationGreater.getGreaterSpecializedWeapons(actor);
    if (intersects(baseTypes, specializations)) {
        shared.damageBonus.push(`${2}[${WeaponSpecializationGreater.label}]`);
    }
}
Hooks.on(customGlobalHooks.actionUseAlterRollData, addWeaponSpecialization);

/**
 * @param {ItemPF} item
 * @returns {ItemConditional | undefined}
 */
export function getGreaterWeaponSpecializaitonConditional(item) {
    const actor = item.actor;
    const baseTypes = item.system.baseTypes;
    if (!actor || !baseTypes?.length) {
        return;
    }

    const specializations = WeaponSpecializationGreater.getGreaterSpecializedWeapons(actor);
    const overlap = intersection(baseTypes, specializations)
    if (overlap.length) {
        const source = actor.itemFlags?.boolean[WeaponSpecializationGreater.key]?.sources?.find((s) => overlap.includes(s.flags[MODULE_NAME]?.[WeaponSpecializationGreater.key]));
        return new pf1.components.ItemConditional({
            default: true,
            name: source?.name ?? '',
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
    if (!actor) return sources;

    const name = WeaponSpecializationGreater.label;

    const baseTypes = item.system.baseTypes;
    if (!baseTypes?.length) return sources;

    const specializations = WeaponSpecializationGreater.getGreaterSpecializedWeapons(actor);
    if (intersects(baseTypes, specializations)) {
        const change = createChangeForTooltip({ name, value: 2 });
        return sources.push(change);
    }

    return sources;
};
Hooks.on(customGlobalHooks.getDamageTooltipSources, getDamageTooltipSources);
